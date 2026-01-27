import express from "express";
import { getGlobalSettings, updateGlobalSettings } from "../controllers/globalSettingsController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.get("/", protect, getGlobalSettings);
router.patch("/", protect, restrictTo("faculty", "admin", "Faculty", "Admin", "hod", "director"), updateGlobalSettings);

export default router;
