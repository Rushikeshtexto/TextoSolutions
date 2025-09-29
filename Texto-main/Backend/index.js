
// server.js
import express from "express";
import cors from "cors";
import userRoutes from "./routes/Userrouter.js";
import passport from "passport";
import session from 'express-session';
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken"
import multer from "multer";
import xlsx from "xlsx";
import db from "./db/DB.js";
import ExcelJS from "exceljs"
import fs from "fs";
import customRoutes from "./routes/customroute.js"
import { v4 as uuidv4 } from "uuid";

import csvParser from "csv-parser";  // since you’re using ES modules
import { authenticate } from "../Backend/middleware/middleware.js";



const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json());
function excelDateToMySQLDate(value) {
  if (!value) return null;

  // Case 1: Excel serial number
  if (!isNaN(value)) {
    const utc_days = Math.floor(value - 25569); // Excel base offset
    const utc_value = utc_days * 86400; // seconds
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().slice(0, 19).replace('T', ' ');
  }

  // Case 2: Already a string date (like "12/9/2025")
  const parsedDate = new Date(value);
  if (!isNaN(parsedDate)) {
    return parsedDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  return null; // invalid value
}




//Google authentication  
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());




passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    const email = req.user.email;

    // check if user exists in DB
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("❌ DB error:", err);
        return res.redirect("http://localhost:5173/home");
      }

      if (results.length === 0) {
        // email not found
        console.log("❌ Email not registered:", email);
       
        return res.status(400).json({ message:"❌ Email not registered:"});
      }

      // email exists → issue JWT
      const user = results[0];
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.redirect(`http://localhost:5173/home?token=${token}`);
    });
  }
);


app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`);
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});


//Upload excel file 

const upload = multer({ dest: "uploads/" });

app.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const name = req.body.name;
    const fileName = req.file.originalname;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const emailuserid = req.user.id;
    const allowedExt = ["xls", "xlsx", "csv"];

    if (!allowedExt.includes(fileExt)) {
      return res.status(400).json({ error: "Only .xls, .xlsx and .csv files are allowed" });
    }

    // ✅ Check if segment name already exists
    let [existing] = await db.promise().query(
      "SELECT id FROM lists_segments WHERE name = ?",
      [name]
    );

    let fileId;
    if (existing.length > 0) {
      fileId = existing[0].id; // reuse existing segment
      console.log("⚠️ Segment exists, using existing fileId:", fileId);
    } else {
      const [segmentResult] = await db.promise().query(
        "INSERT INTO lists_segments (name, file_name, type, profiles) VALUES (?, ?, ?, ?)",
        [name, fileName, "list", 0]
      );
      fileId = segmentResult.insertId;
      console.log("✅ Inserted new fileId:", fileId);
    }

    // ✅ Batch insert setup
    const BATCH_SIZE = 5000;
    let batch = [];
    let totalRows = 0;

    async function insertBatch(batch) {
      if (batch.length === 0) return;
      try {
        const [result] = await db.promise().query(
          `INSERT INTO excelusers 
            (id, first_name, last_name, email, address_1, address_2, file_id, phone, city, state, country, user_id, property)
           VALUES ? 
           ON DUPLICATE KEY UPDATE
             first_name=VALUES(first_name),
             last_name=VALUES(last_name),
             address_1=VALUES(address_1),
             address_2=VALUES(address_2),
             file_id=VALUES(file_id),
             city=VALUES(city),
             state=VALUES(state),
             country=VALUES(country),
             user_id=VALUES(user_id),
             property=VALUES(property)`,
          [batch]
        );
        console.log(`Inserted: ${result.affectedRows - result.changedRows} rows, Updated: ${result.changedRows} rows`);
      } catch (err) {
        console.error("❌ excelusers insert/update error:", err);
      }
    }

    const FIXED_HEADERS = [
      "first_name","last_name","address_1","address_2",
      "phone","email","city","state","country"
    ];

    const invalidRows = [];
// ✅ Add this at the top of your file
const isValidPhone = (phone) => {
  // simple regex for 10-digit numbers, adjust if needed
  return /^\d{10}$/.test(phone);
};

    // ✅ Process CSV
    if (fileExt === "csv") {
      const stream = fs.createReadStream(req.file.path).pipe(csvParser({
        mapHeaders: ({ header }) => header ? header.replace(/^\uFEFF/, "").replace(/^"|"$/g, "").trim().toLowerCase().replace(/\s+/g, "_") : null
      }));

      for await (const row of stream) {
        const userId = uuidv4();
        const rawPhone = (row.phone || row.Phone || "").toString().trim();
        const phone = isValidPhone(rawPhone) ? rawPhone : null;

        if (!phone) invalidRows.push({ phone: rawPhone });

        const fixedRow = [
          userId,
          row.first_name || row.First_Name || "",
          row.last_name || row.Last_Name || "",
          row.email || row.Email || "",
          row.address_1 || row.Address_1 || "",
          row.address_2 || row.Address_2 || "",
          fileId,
          phone,
          row.city || row.City || "",
          row.state || row.State || "",
          row.country || row.Country || "",
          emailuserid,
          JSON.stringify(Object.fromEntries(Object.entries(row).filter(([k]) => !FIXED_HEADERS.includes(k.toLowerCase()))))
        ];

        batch.push(fixedRow);
        totalRows++;

        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch);
          batch = [];
        }
      }
    } else {
      // ✅ Process Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];
      let headers = [];

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) {
          headers = row.values.map(h => h ? h.toString().trim().toLowerCase() : "");
          return;
        }
        const obj = {};
        headers.forEach((h, i) => { if(h) obj[h] = row.values[i] || ""; });

        const userId = uuidv4();
        const fixedRow = [
          userId,
          obj.first_name || "",
          obj.last_name || "",
          obj.email || "",
          obj.address_1 || "",
          obj.address_2 || "",
          fileId,
          (obj.phone || "").toString(),
          obj.city || "",
          obj.state || "",
          obj.country || "",
          emailuserid,
          JSON.stringify(Object.fromEntries(Object.entries(obj).filter(([k]) => !FIXED_HEADERS.includes(k))))
        ];

        batch.push(fixedRow);
        totalRows++;

        if (batch.length >= BATCH_SIZE) insertBatch(batch);
      });
    }

    if (batch.length > 0) await insertBatch(batch);

    // ✅ Update profile count
    if (totalRows === 0) {
      await db.promise().query("DELETE FROM lists_segments WHERE id=?", [fileId]);
    } else {
      await db.promise().query("UPDATE lists_segments SET profiles=? WHERE id=?", [totalRows, fileId]);
    }

    res.json({ status: "success", fileId, insertedOrUpdated: totalRows });

  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  } finally {
    fs.unlink(req.file.path, () => {}); // cleanup
  }
});




// Fetch data from SQL
app.get("/data", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS count FROM excelusers", (err, countResult) => {
    if (err) return res.status(500).json({ error: err });

    const totalRows = countResult[0].count;
    const lastPage = Math.ceil(totalRows / limit);

    db.query("SELECT * FROM excelusers LIMIT ? OFFSET ?", [limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ data: results, totalRows, lastPage });
    });
  });
});



app.get("/files", (req, res) => {
  db.query(
  "SELECT * FROM lists_segments WHERE is_deleted=0 OR is_deleted IS NULL ORDER BY created_at DESC",
  (err, results) => {
    if (err) throw err;
    res.json(results);
  }
);
});

app.post("/files/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE lists_segments SET is_deleted = true WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error updating row:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Record not found" });
      }

      res.json({ message: "Record soft deleted successfully", result });
    }
  );
});

// Get profiles for a file
app.get("/profiles/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // 1️⃣ Count total rows
  db.query("SELECT COUNT(*) AS count FROM excelusers WHERE file_id=?", [fileId], (err, countResult) => {
    if (err) return res.status(500).json({ error: err });
    const totalRows = countResult[0].count;
    const lastPage = Math.ceil(totalRows / limit);

    // 2️⃣ Fetch paginated results
    db.query(
      "SELECT * FROM excelusers WHERE file_id=? LIMIT ? OFFSET ?",
      [fileId, limit, offset],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        
        res.json({
          data: results,
          totalRows,
          lastPage
        });
      }
    );
  });
});



// Get single excel user by plain ID
app.get("/excelusers/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM excelusers WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

app.post("/lists/:Id", (req, res) => {
  db.query("SELECT * FROM lists_segments WHERE id=?", [req.params.Id], (err, results) => {
    res.json(results)
  });
});

app.get("/export/users/:id", (req, res) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

  // Create a streaming workbook (writes directly to response)
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const worksheet = workbook.addWorksheet("Users");

  worksheet.columns = [
    { header: "First Name", key: "first_name", width: 20 },
    { header: "Last Name", key: "last_name", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Address 1", key: "address_1", width: 30 },
    { header: "Address 2", key: "address_2", width: 30 },
    { header: "City", key: "city", width: 20 },
    { header: "State", key: "state", width: 20 },
    { header: "Country", key: "country", width: 20 },
  ];

  // Stream rows from DB
  const queryStream = db
    .query(
      `SELECT first_name, last_name, email, phone, address_1, address_2, city, state, country 
       FROM excelusers WHERE file_id = ?`,
      [req.params.id]
    )
    .stream();

  queryStream.on("data", (row) => {
    worksheet.addRow(row).commit();
  });

  queryStream.on("end", async () => {
    await worksheet.commit();
    await workbook.commit();
  });

  queryStream.on("error", (err) => {
    console.error("SQL Stream Error:", err);
    res.status(500).end("Error generating Excel");
  });
});



// Get all properties
app.get("/property", (req, res) => {
  db.query("SELECT * FROM add_property", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


app.post("/listname",authenticate, (req, res) => {
  db.query(
    "SELECT * FROM lists_segments where is_deleted=0 and user_id=? and name=?",
    [req.user.id , req.body.name],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});


app.get("/property/users/:id/properties", (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT * FROM add_property WHERE is_deleted = 0 AND user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});


// Add new property
app.post("/property/users/:id/property", (req, res) => {
  const { name, value, type } = req.body;

  if (!name || !value || !type)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "INSERT INTO add_property (user_id, name, value, type) VALUES (?, ?, ?, ?)",
    [req.params.id, name, value, type],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, name, value, type });
    }
  );
});


// Edit property
app.put("/property", (req, res) => {
  const { id, name, value, type } = req.body;

  if (!id || !name || !value || !type)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "UPDATE add_property SET name = ?, value = ?, type = ? WHERE id = ?",
    [name, value, type, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Property updated successfully" });
    }
  );
});

// Soft delete property
app.delete("/property", (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "Property ID is required" });

  db.query(
    "UPDATE add_property SET is_deleted = 1 WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Property soft deleted successfully" });
    }
  );
});




// User routes
app.use("/users", userRoutes);
app.use("/custom", customRoutes); 


app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});






















