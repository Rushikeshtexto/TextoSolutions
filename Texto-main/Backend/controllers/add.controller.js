// controllers/propertyController.js
const db = require("../db"); // adjust path to your db connection

// Get all properties (not deleted)
exports.getProperties = (req, res) => {
  db.query("SELECT * FROM add_property WHERE is_deleted = 0", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Add new property
exports.addProperty = (req, res) => {
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
};

// Edit property
exports.editProperty = (req, res) => {
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
};

// Soft delete property
exports.deleteProperty = (req, res) => {
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
};
