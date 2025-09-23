// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();

const propertyController = require("../controllers/add.controller");

// Routes
router.get("/", propertyController.getProperties);
router.post("/", propertyController.addProperty);
router.put("/", propertyController.editProperty);
router.delete("/", propertyController.deleteProperty);

module.exports = router;
