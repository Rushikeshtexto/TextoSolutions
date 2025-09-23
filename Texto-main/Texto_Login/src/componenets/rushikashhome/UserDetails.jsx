import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "./UserDetails.module.css";

import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';



const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [property, setProperty] = useState({ id: null, name: "", value: "", datatype: "" });
  const [properties, setProperties] = useState([]);

  // Fetch user by ID
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/excelusers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("User not found or invalid ID");
        setUser(null);
        setLoading(false);
      });
  }, [id]);

  // Fetch properties
  const fetchProperties = async () => {
  try {
    const res = await fetch(`http://localhost:5000/property/users/${id}/properties`);
    if (!res.ok) throw new Error("Failed to fetch properties");
    const data = await res.json();
    setProperties(data);
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    fetchProperties();
  }, []);

  // Mask email
  const maskEmail = (email) => {
    if (!email) return "";
    const [, domain] = email.split("@");
    return "*****@" + domain;
  };

  // Mask phone
  const maskPhone = (phone) => {
    if (!phone) return "";
    if (phone.length <= 3) return phone;
    return "*".repeat(phone.length - 3) + phone.slice(-3);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  // Save (Add or Edit)
  const handleSave = async () => {
  try {
    const url = property.id
      ? "http://localhost:5000/property" // We'll create this endpoint for PUT later
      : `http://localhost:5000/property/users/${id}/property`; // POST add property

    const method = property.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: property.id, // required only for edit
        name: property.name,
        value: property.value,
        type: property.datatype,
      }),
    });

    if (!res.ok) throw new Error("Failed to save property");

    setShowPopup(false);
    setProperty({ id: null, name: "", value: "", datatype: "" });
    fetchProperties(); // refresh list
  } catch (err) {
    console.error(err);
  }
};


  // Edit property
  const handleEdit = (prop) => {
    setProperty({ id: prop.id, name: prop.name, value: prop.value, datatype: prop.type });
    setShowPopup(true);
  };

  // Soft delete property
  const handleDelete = async (id) => {
    try {
      const res = await fetch("http://localhost:5000/property/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete property");
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}>
          <SideBar />
        </div>

        <div className={styles.content}>
          <button className={styles.backbtn} onClick={() => navigate(-1)}>← Back</button>

          <div className={styles.side}>
            <h2 className={styles.profiletitle}>
              {user.first_name
                ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)
                : "Profile"}'s Profile
            </h2>

            <div className={styles.profileinfo}>
              <p><span className={styles.label}>First Name:</span><span className={styles.value}>{user.first_name}</span></p>
              <p><span className={styles.label}>Last Name:</span><span className={styles.value}>{user.last_name}</span></p>
              <p><span className={styles.label}>Email:</span><span className={styles.value}>{maskEmail(user.email)}</span></p>
              <p><span className={styles.label}>Phone:</span><span className={styles.value}>{maskPhone(user.phone)}</span></p>
              <p><span className={styles.label}>Address 1:</span><span className={styles.value}>{user.address_1 || ""}</span></p>
              <p><span className={styles.label}>Address 2:</span><span className={styles.value}>{user.address_2 || ""}</span></p>
              <p><span className={styles.label}>City:</span><span className={styles.value}>{user.city || ""}</span></p>
              <p><span className={styles.label}>State:</span><span className={styles.value}>{user.state || ""}</span></p>
              <p><span className={styles.label}>Country:</span><span className={styles.value}>{user.country || ""}</span></p>
            </div>
          </div>

          <div className={styles.listlogs}>
            <h4>Information</h4>
            <div className={styles.customproperty}>
              <p>Custom Properties</p>
              <button onClick={() => setShowPopup(true)}>+ Add Property</button>
            </div>

            {properties.length > 0 ? (
              <table className={styles.Tablecontainer}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Action</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr key={prop.id}>
                      <td>{prop.name}</td>
                      <td>{prop.value}</td>
                     
                      <td>
                        <EditIcon
                                color="red"
                                
                                style={{ cursor: "pointer", marginRight:"16px" }}
                                onClick={() => handleEdit(prop)}
                              />
                              <DeleteIcon 
                              color="error"
                                style={{ cursor: "pointer" }}
                                onClick={() =>  handleDelete(prop.id)}/>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No properties added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popup for Add/Edit */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer}>
            <h3>{property.id ? "Edit Property" : "Add Custom Property"}</h3>

            <label className={styles.popupLabel}>
              Name:
              <input type="text" name="name" value={property.name} onChange={handleChange} />
            </label>

            <label className={styles.popupLabel}>
              Value:
              <input type="text" name="value" value={property.value} onChange={handleChange} />
            </label>

            <label className={styles.popupLabel}>
              Datatype:
              <select name="datatype" value={property.datatype} onChange={handleChange}>
                <option value="">Select</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
            </label>

            <div className={styles.popupButtons}>
              <button onClick={handleSave}>{property.id ? "Update" : "Save"}</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserDetails;




/*


import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import multer from "multer";
import db from "./db/DB.js";
import ExcelJS from "exceljs";
import fs from "fs";
import csvParser from "csv-parser";
import userRoutes from "./routes/Userrouter.js"; 
const app = express();
app.use(express.json());
app.use(cors());

function excelDateToMySQLDate(value) {
  if (!value) return null;

  if (!isNaN(value)) {
    const utc_days = Math.floor(value - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().slice(0, 19).replace('T', ' ');
  }

  const parsedDate = new Date(value);
  if (!isNaN(parsedDate)) {
    return parsedDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  return null;
}

// ------------------- GOOGLE AUTH -------------------
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

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) return res.redirect("http://localhost:5173/home");
      if (results.length === 0) return res.status(400).json({ message: "Email not registered" });

      const user = results[0];
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

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

// ------------------- UPLOAD EXCEL/CSV -------------------
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = req.file.originalname;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const allowedExt = ["xls", "xlsx", "csv"];
    if (!allowedExt.includes(fileExt)) return res.status(400).json({ error: "Only .xls, .xlsx and .csv files are allowed" });

    // Insert into lists_segments
    let fileId;
    try {
      const [segmentResult] = await db.promise().query(
        "INSERT INTO lists_segments (name, type, profiles) VALUES (?, ?, ?)",
        [fileName, "list", 0]
      );
      fileId = segmentResult.insertId;
    } catch (err) {
      return res.status(500).json({ error: "lists_segments insert failed" });
    }

    let totalRows = 0;
    const BATCH_SIZE = 5000;
    let batch = [];

    async function insertBatch(batch) {
      if (batch.length === 0) return;
      await db.promise().query(
        `INSERT INTO excelusers 
          (first_name,last_name,email,address_1,address_2,file_id,phone,city,state,country) 
         VALUES ? 
         ON DUPLICATE KEY UPDATE 
          first_name=VALUES(first_name),
          last_name=VALUES(last_name),
          email=VALUES(email),
          address_1=VALUES(address_1),
          address_2=VALUES(address_2),
          file_id=VALUES(file_id),
          city=VALUES(city),
          state=VALUES(state),
          country=VALUES(country)`,
        [batch]
      );
    }

    if (fileExt === "csv") {
      const stream = fs.createReadStream(req.file.path).pipe(csvParser());
      for await (const row of stream) {
        batch.push([
          row.First_Name || row.first_name || row.FIRST_NAME || "",
          row.Last_Name || row.last_name || row.LAST_NAME || "",
          row.Email || row.email || row.EMAIL || "",
          row.Address_1 || row.address_1 || row.ADDRESS_1 || "",
          row.Address_2 || row.address_2 || row.ADDRESS_2 || "",
          fileId,
          (row.Phone || row.phone || row.PHONE || "").toString(),
          row.City || row.city || row.CITY || "",
          row.State || row.state || row.STATE || "",
          row.Country || row.country || row.COUNTRY || "",
        ]);
        totalRows++;
        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch);
          batch = [];
        }
      }
    } else {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];
      const headers = worksheet.getRow(1).values;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = {};
        headers.forEach((h, i) => {
          if (h) obj[h.toString().toLowerCase()] = row.values[i];
        });
        batch.push([
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
        ]);
        totalRows++;
        if (batch.length >= BATCH_SIZE) {
          insertBatch(batch);
          batch = [];
        }
      });
    }

    if (batch.length > 0) await insertBatch(batch);

    await db.promise().query("UPDATE lists_segments SET profiles=? WHERE id=?", [totalRows, fileId]);

    res.json({ status: "success", fileId, insertedOrUpdated: totalRows });
  } catch (err) {
    res.status(500).json({ error: `Upload failed: ${err}` });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

// ------------------- FETCH USERS -------------------
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
  db.query("SELECT * FROM lists_segments WHERE is_deleted=0 OR is_deleted IS NULL ORDER BY created_at DESC", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post("/files/:id", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE lists_segments SET is_deleted = true WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record soft deleted successfully", result });
  });
});

app.get("/profiles/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS count FROM excelusers WHERE file_id=?", [fileId], (err, countResult) => {
    if (err) return res.status(500).json({ error: err });
    const totalRows = countResult[0].count;
    const lastPage = Math.ceil(totalRows / limit);

    db.query("SELECT * FROM excelusers WHERE file_id=? LIMIT ? OFFSET ?", [fileId, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ data: results, totalRows, lastPage });
    });
  });
});

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
    res.json(results);
  });
});

app.get("/export/users/:id", (req, res) => {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

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

  const queryStream = db.query(
    "SELECT first_name, last_name, email, phone, address_1, address_2, city, state, country FROM excelusers WHERE file_id = ?",
    [req.params.id]
  ).stream();

  queryStream.on("data", (row) => worksheet.addRow(row).commit());
  queryStream.on("end", async () => { await worksheet.commit(); await workbook.commit(); });
  queryStream.on("error", (err) => { res.status(500).end("Error generating Excel"); });
});

// ------------------- CUSTOM PROPERTIES -------------------

// Get all properties
app.get("/property", (req, res) => {
  db.query("SELECT * FROM add_property", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get properties for a user
// Get all properties (no user_id)
app.get("/property/users/:id/properties", (req, res) => {
  db.query("SELECT * FROM add_property WHERE is_deleted = 0", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add new property
app.post("/property/users/:id/property", (req, res) => {
  const { name, value, type } = req.body;

  if (!name || !value || !type)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "INSERT INTO add_property (name, value, type) VALUES (?, ?, ?)",
    [name, value, type],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, name, value, type });
    }
  );
});


app.use("/users", userRoutes);

// ------------------- START SERVER -------------------
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
*/