// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getuserbyemail,
 
} from "../controllers/User.js";

const router = express.Router();



router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/login",loginUser);
router.post("/getuser",getuserbyemail);

export default router;
