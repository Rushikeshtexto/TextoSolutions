
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
    const name = req.body.name
    const fileName = req.file.originalname;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const emailuserid = req.user.id; 
    const allowedExt = ["xls", "xlsx", "csv"];
    if (!allowedExt.includes(fileExt)) {
      return res
        .status(400)
        .json({ error: "Only .xls, .xlsx and .csv files are allowed" });
    }

    // Insert into lists_segments first
    let fileId;
    let result ="";
    try {
      const [segmentResult] = await db
        .promise()
        .query(
          "INSERT INTO lists_segments (name,file_name, type, profiles) VALUES (?,?, ?, ?)",
          [name ,fileName, "list", 0] // will update profiles count later
        );
        
        const [rows] = await db.promise().query(
  "SELECT id FROM lists_segments WHERE file_name=? ORDER BY created_at DESC LIMIT 1",
  [fileName]
);
     fileId = rows[0].id;
      console.log("✅ Inserted fileId:", fileId);
    } catch (err) {
      console.error("❌ lists_segments insert error:", err);
      return res.status(500).json({ error: "lists_segments insert failed" });
    }
   
    let totalRows = 0;
    const BATCH_SIZE = 5000;
    let batch = [];
    let updatedrows = 0;
    // Helper to insert batch
    async function insertBatch(batch) {
      if (batch.length === 0) return;

      try {
        const [result] = await db.promise().query(
          `INSERT INTO excelusers 
              (id ,first_name,last_name, email, address_1,address_2, file_id, phone, city, state,country,user_id,property) 
           VALUES ? 
           ON DUPLICATE KEY UPDATE 
              first_name=VALUES(first_name),
              last_name = VALUES(last_name),
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
        updatedrows += result.changedRows;
        console.log(`Inserted: ${result.affectedRows - result.changedRows} rows`);
        console.log(`Updated: ${result.changedRows} rows`);
      } catch (err) {
        console.error("❌ excelusers insert/update error:", err);

      }
    }

    // async function insertCustomBatch(customBatch) {
    //   if (customBatch.length === 0) return;

    //   try {
    //     const [result] = await db.promise().query(
    //       `INSERT INTO property
    //           (row_id,file_id, property_name, property_value) 
    //        VALUES ?`,
    //       [customBatch]
    //     );
    //     console.log(`✅ Inserted ${result.affectedRows} custom property rows`);
    //   } catch (err) {
    //     console.error("❌ user_custom_property insert error:", err);
    //   }
    // }

    let customBatch = [];


    // Process file based on extension
    // Normalize headers to lowercase and trim spaces
    // For CSV, also remove BOM and surrounding quotes  


const FIXED_HEADERS = [
  "first_name","last_name","address_1","address_2",
  "phone","email","city","state","country"
];


const invalidRows = [];
    if (fileExt === "csv") {   
      // Handle CSV with stream
      const stream = fs.createReadStream(req.file.path).pipe(csvParser({
        mapHeaders: ({ header }) => {
          if (!header) return null;
          return header
            .replace(/^\uFEFF/, "")   // remove BOM if present
            .replace(/^"|"$/g, "")    // 🔥 remove surrounding quotes
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");    // spaces → underscores
        }
      }));
      
// Object.keys(obj).forEach(key => {
//   if (!FIXED_HEADERS.includes(key)) {
//     customData[key] = obj[key];
//   }
// });
      stream.on("headers", (headers) => {
        console.log("Headers detected:", headers.map(h => JSON.stringify(h)));
      });
      for await (const row of stream) {
        const rawPhone = (row.Phone || row.phone || row.PHONE || "").toString().trim();

const phone = isValidPhone(rawPhone) ? rawPhone : null;
if (!isValidPhone(rawPhone)) {
  invalidRows.push({
    rowNumber: idx + 1, 
    phone: rawPhone
  });
}
        const userId = uuidv4();
        // console.log("first name ",row.first_name);
        // Build fixed data row
  const fixedRow = [
    userId,
    row.First_Name || row.first_name || row.FIRST_NAME || "",
    row.Last_Name || row.last_name || row.LAST_NAME || "",
    row.Email || row.email || row.EMAIL || "",
    row.Address_1 || row.address_1 || row.ADDRESS_1 || "",
    row.Address_2 || row.address_2 || row.ADDRESS_2 || "",
    fileId,
    phone,
    row.City || row.city || row.CITY || "",
    row.State || row.state || row.STATE || "",
    row.Country || row.country || row.COUNTRY || "",
    emailuserid
  ];

  batch.push(fixedRow);
  const customData = {};
  Object.keys(row).forEach((key) => {
    const normalized = key.toLowerCase().trim();
    if (!FIXED_HEADERS.includes(normalized)) {
      customData[normalized] = row[key] || "";
    }
  });

  // 🔹 Add JSON string to batch
  fixedRow.push(JSON.stringify(customData));

  // Now handle custom fields (anything not in FIXED_HEADERS)
  // Object.keys(row).forEach((key) => {
  //   const normalized = key.toLowerCase().trim();
  //   if (!FIXED_HEADERS.includes(normalized)) {
  //     customBatch.push([
  //       userId,              // placeholder for user_id (we’ll map later after insert)
  //       fileId,            // file_id
  //       normalized,        // property_name
  //       row[key] || ""     // property_value
  //     ]);
  //   }
  // });
        // console.log("batch ",batch);

        totalRows++;
        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch);
          // await insertCustomBatch(customBatch);
          // customBatch = [];
          batch = [];
        }
      }
    } else {
      // Handle Excel with ExcelJS streaming
  const workbook = new ExcelJS.Workbook();
  const stream = fs.createReadStream(req.file.path);

  await workbook.xlsx.read(stream);

  const worksheet = workbook.worksheets[0];

  let headers = [];
  worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
    if (rowNumber === 1) {
      headers = row.values.map(h =>
        h ? h.toString().trim().toLowerCase() : ""
      );
      return;
    }
    const userId = uuidv4();
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = row.values[i] || "";
    });

      // separate custom (non-fixed) fields into JSON
  const customFields = {};
  Object.keys(obj).forEach((key) => {
    if (!FIXED_HEADERS.includes(key)) {
      customFields[key] = obj[key];
    }
  });
   
    
    batch.push([
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
      JSON.stringify(customFields) 
    ]);

    totalRows++;
    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch); // make sure this is async
      batch = [];
    }
  });

  // flush last batch
  if (batch.length > 0) {
    await insertBatch(batch);
  }

      //   totalRows++;
      //   if (batch.length >= BATCH_SIZE) {
      //     insertBatch(batch);
      //     batch = [];
      //   }
      // });
    }

    // Insert remaining rows
    if (batch.length > 0) {
      await insertBatch(batch);
      batch = [];
    }


    // Update profile count
    console.log("Total rows processed:", totalRows);
    if(totalRows == 0){
      await db
      .promise()
      .query("DELETE FROM lists_segments WHERE id=?", [
        fileId,
      ]);
    }else{
await db
      .promise()
      .query("UPDATE lists_segments SET profiles=? WHERE id=?", [
        totalRows,
        fileId,
      ]);

    }
    
    res.json({
      status: "success",
      fileId,
      insertedOrUpdated: totalRows,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  } finally {
    fs.unlink(req.file.path, () => {}); // cleanup uploaded file
  }
});



// Fetch data from SQL
app.get("/data", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;

  db.query("SELECT * FROM excelusers LIMIT ? OFFSET ?", [limit, offset], (err, results) => {
    if (err) throw err;
    res.json(results);
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






















