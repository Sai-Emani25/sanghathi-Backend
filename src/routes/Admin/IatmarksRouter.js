import { Router } from "express";
import {
  submitIatData,
  deleteAllIat,
  getIatById,
  getIatData,
  deleteSemester,
  deleteMultipleSemesters,
} from "../../controllers/Admin/IatMarksController.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * GET - Get IAT data for a specific user
 * POST - Submit or update IAT data
 * DELETE - Delete all IAT records
 */
router.route("/:userId")
  .get(getIatData)
  .post(submitIatData)
  .delete(deleteAllIat);

/**
 * For backward compatibility - get by ID
 */
router.get("/:id", getIatById);

/**
 * DELETE - Delete a specific semester
 */
router.delete("/:userId/semester/:semester", deleteSemester);

/**
 * DELETE - Delete multiple semesters
 */
router.post("/:userId/delete-semesters", deleteMultipleSemesters);

export default router;