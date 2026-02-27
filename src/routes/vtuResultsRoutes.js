import express from "express";
import {
  getVTUResults,
  addVTUResults,
  updateSemesterResults,
  getVTUResultsSummary,
  getSemesterResults,
  deleteVTUResults,
  fetchExternalMarksFromVTU,
} from "../../controllers/Student/vtuResultsController.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Fetch external marks directly from VTU official portal by USN
router.post("/external/fetch", fetchExternalMarksFromVTU);

// Get all VTU results for a student
router.get("/:userId", getVTUResults);

// Get VTU results summary (CGPA, semester-wise SGPA)
router.get("/:userId/summary", getVTUResultsSummary);

// Get results for a specific semester
router.get("/:userId/semester/:semesterNumber", getSemesterResults);

// Add or update VTU results
router.post("/:userId", addVTUResults);

// Update a specific semester's results
router.put("/:userId/semester/:semesterNumber", updateSemesterResults);

// Delete VTU results
router.delete("/:userId", deleteVTUResults);

export default router;
