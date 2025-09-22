import express from "express";
import {
    getitems,
    additem,
    softdelete,
    updateitem,
    deleteitem,
    getitembyid } from "../controllers/Custom.controller.js";
const router = express.Router();

router.get("/", getitems);
router.get("/:id", getitembyid);
router.post("/", additem);
router.put("/:id", updateitem);
router.delete("/:id", deleteitem);  
router.post("/softdelete/:id", softdelete);
export default router;