// src/controllers/conversationController.js
import Conversation from "../models/Conversation.js";

/**
 * Create a mentor-mentee conversation for a specific semester.
 * Enforces a max of 2 conversations per mentee per semester.
 */
export const createConversationForSemester = async (req, res) => {
  try {
    const {
      menteeId,
      mentorId,
      semester,
      moocCompleted,
      miniProjectCompleted,
      title,
      topic,
      summary,
    } = req.body;

    // 🔹 Basic validation
    if (!menteeId || !mentorId || !semester || !summary || summary.trim().length < 30) {
      return res.status(400).json({
        message: "menteeId, mentorId, semester, and summary (min 30 chars) are required",
      });
    }

    // 🔹 Check existing conversations count
    const existingCount = await Conversation.countDocuments({ menteeId, semester });
    if (existingCount >= 2) {
      return res.status(409).json({
        message: "Limit reached: This mentee already has 2 mentoring sessions for this semester",
      });
    }

    // 🔹 Create and save conversation
    const conversation = new Conversation({
      menteeId,
      mentorId,
      semester,
      moocCompleted: !!moocCompleted,
      miniProjectCompleted: !!miniProjectCompleted,
      title: title?.trim() || "",
      topic: topic?.trim() || "",
      summary: summary.trim(),
      date: new Date(),
    });

    const savedConversation = await conversation.save();

    return res.status(201).json({
      message: "Conversation saved successfully",
      data: savedConversation,
    });
  } catch (err) {
    console.error("Error creating conversation:", err);
    return res.status(500).json({
      message: "Server error while creating conversation",
      error: err.message,
    });
  }
};

/**
 * Get all conversations for a given mentee (filtered by semester).
 * Returns total count, last session, and full session list.
 */
export const getSemesterConversationInfo = async (req, res) => {
  try {
    const { menteeId, semester } = req.query;

    if (!menteeId || !semester) {
      return res.status(400).json({
        message: "menteeId and semester query parameters are required",
      });
    }

    const sessions = await Conversation.find({ menteeId, semester })
      .populate("mentorId", "name email")
      .sort({ date: -1 });

    return res.status(200).json({
      count: sessions.length,
      lastSession: sessions[0] || null,
      sessions,
    });
  } catch (err) {
    console.error("Error fetching semester conversations:", err);
    return res.status(500).json({
      message: "Server error while fetching conversation data",
      error: err.message,
    });
  }
};

/**
 * Get all conversations for a mentor (across mentees and semesters)
 */
export const getConversationsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;

    if (!mentorId) {
      return res.status(400).json({ message: "mentorId is required in params" });
    }

    const conversations = await Conversation.find({ mentorId })
      .populate("menteeId", "name email")
      .sort({ semester: 1, date: -1 });

    return res.status(200).json({
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    console.error("Error fetching mentor conversations:", err);
    return res.status(500).json({
      message: "Server error while fetching mentor's conversations",
      error: err.message,
    });
  }
};

/**
 * Get semester-based mentoring status for a mentee
 * Useful for UI to show "Mentoring Already Done"
 */
export const getMenteeSemesterStatus = async (req, res) => {
  try {
    const { menteeId, semester } = req.query;

    if (!menteeId || !semester) {
      return res.status(400).json({
        message: "menteeId and semester query params are required",
      });
    }

    const sessions = await Conversation.find({ menteeId, semester })
      .sort({ date: -1 })
      .select("title date summary");

    return res.status(200).json({
      semester,
      totalSessions: sessions.length,
      lastSession: sessions[0] || null,
      allSessions: sessions,
    });

  } catch (err) {
    console.error("Error fetching semester status:", err);
    return res.status(500).json({
      message: "Server error while fetching semester status",
      error: err.message,
    });
  }
};
