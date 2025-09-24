import db from "../db/DB.js";

// ---------------- Master properties ----------------
export const getitems = (req, res) => {
  db.query("SELECT * FROM custom_property WHERE is_deleted=0", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const additem = (req, res) => {
  const { name, type } = req.body;

  const sql = `
    INSERT INTO custom_property (name, type, created_at, updated_at)
    VALUES (?, ?, NOW(), NOW())
  `;

  db.query(sql, [name, type], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Item added successfully", id: result.insertId });
  });
};

export const updateitem = (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  const sql = `
    UPDATE custom_property
    SET name = ?, type = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [name, type, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item updated successfully" });
  });
};

export const deleteitem = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM custom_property WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item deleted successfully" });
  });
};

export const getitembyid = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM custom_property WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Item not found" });
    res.json(results[0]);
  });
};

export const softdelete = (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE custom_property
    SET is_deleted = 1, updated_at = NOW()
    WHERE id = ?
  `;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item soft-deleted successfully" });
  });
};

// ---------------- User-specific properties ----------------
export const getUserProperties = (req, res) => {
  const { userId } = req.params;
  db.query(
    "SELECT * FROM user_custom_property WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

export const addUserProperty = (req, res) => {
  const { userId } = req.params;
  const { name, type, value } = req.body;

  const sql = `
    INSERT INTO user_custom_property (user_id, name, type, value, created_at, updated_at)
    VALUES (?, ?, ?, ?, NOW(), NOW())
  `;
  db.query(sql, [userId, name, type, value], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "User property added", id: result.insertId });
  });
};

export const updateUserProperty = (req, res) => {
  const { id } = req.params;
  const { name, type, value } = req.body;

  const sql = `
    UPDATE user_custom_property
    SET name = ?, type = ?, value = ?, updated_at = NOW()
    WHERE id = ?
  `;
  db.query(sql, [name, type, value, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User property not found" });
    res.json({ message: "User property updated" });
  });
};

export const deleteUserProperty = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM user_custom_property WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User property deleted" });
  });
};
