// controllers/userController.js
import db from "../db/DB.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";


const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

export const getUsers = (req, res) => {
  db.query("SELECT id, name, email, phone, location, first_active, last_update FROM users", (err, results) => {
    if (err) {
      console.error("❌ SQL Error:", err.sqlMessage);
      return res.status(500).json({ error: err.message })};
    res.json(results);
  });
};

export const getuserbyemail = (req,res) => {
  const {email} = req.body;
  db.query("Select id, name, email, phone, location, first_active, last_update FROM users WHERE email = ? ",[email],(err,results)=>{
    if(err) return res.status(500).json({error:err.message});
    if (results.length > 0) {
      res.json({ exists: true, user: results[0] }); 
    } else {
      res.json({ exists: false });
    }
  })
}
export const getUserById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, name, email, phone, location, first_active, last_update FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
};

// 📌 Create new user
export const createUser = (req, res) => {
  const { name, email, phone, location, password } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ message: "Phone must be at least 10 digits" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Check email exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ message: "Email already exists" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
  "INSERT INTO users (name, email, phone, location, password, first_active, last_update) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
  [name, email, phone, location, hashedPassword],
  (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err.sqlMessage); // <--- log MySQL error message
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      phone,
      location,
      message: "User created successfully",
    });
  }
);

    } catch (hashErr) {
      res.status(500).json({ error: hashErr.message });
    }
  });
};

// 📌 Update user (prevent duplicate email, hash new password if provided)
export const updateUser = (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.phone && updates.phone.length < 10) {
    return res.status(400).json({ message: "Phone must be at least 10 digits" });
  }

  // If password included, hash it
  const handleUpdate = async () => {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const fields = [];
    const values = [];

    for (let key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(", ")}, last_update = NOW() WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
      res.json({ id, ...updates, message: "User updated successfully" });
    });
  };

  handleUpdate().catch((err) => res.status(500).json({ error: err.message }));
};

// 📌 Delete user
export const deleteUser = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  });
};


export const loginUser = (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      console.log("👉 Login payload:", req.body); 
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ message: "Invalid email" });
  
      const user = results[0];
  
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }
  
        // Generate JWT token (valid for 1h)
        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
  
        res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
          },
        });
      } catch (compareErr) {
        res.status(500).json({ error: compareErr.message });
      }
    });
  };


  const SECRET_KEY = "mySecretKey123";



/*
export const getAllUsers = (req, res) => {
  db.query("SELECT * FROM excelusers", (err, results) => {
    if (err) return res.status(500).json({ error: err });

    // Encrypt user IDs before sending
    const usersWithEncryptedIds = results.map(user => ({
      ...user,
      encryptedId: CryptoJS.AES.encrypt(user.id.toString(), SECRET_KEY).toString()
    }));

    res.json(usersWithEncryptedIds);
  });
};

// Get single user by encrypted ID
export const getUserByEncryptedId = (req, res) => {
  const { encryptedId } = req.params;

  try {
    const decryptedId = CryptoJS.AES.decrypt(encryptedId, SECRET_KEY).toString(CryptoJS.enc.Utf8);

    db.query("SELECT * FROM excelusers WHERE id = ?", [decryptedId], (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(results[0]);
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid encrypted ID" });
  }
};

  */
 // Get user by UUID
export const getUserByUUID = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM excelusers WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
};
