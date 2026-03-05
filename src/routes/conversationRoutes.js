import { Router } from "express";
import Conversation from "../models/Conversation.js";


const router = Router();
// ✅ Check mentor-mentee conversation count per semester
router.get("/check", async (req, res) => {
  try {
    const {
      mentorId,
      menteeId,
      semester,
      academicYear,
      moocChecked,
      projectChecked,
      conversationText,
      title,
      topic,
    } = req.body;
    const count = await Conversation.countDocuments({
      mentorId,
      menteeId,
      semester: Number(semester),
      academicYear,
      isOffline: true,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to check conversation count" });
  }
});
// ✅ Get all conversations
router.get("/", async (req, res) => {
 try {
   const conversations = await Conversation.find();
   res.status(200).json(conversations);
 } catch (err) {
   res.status(500).json(err);
 }
});

<<<<<<< HEAD
// ✅ New route: Mentor–Mentee Offline Conversation with Gemini Summary
// IMPORTANT: This must come BEFORE /:userId routes to avoid route conflicts
router.post("/mentor-mentee", async (req, res) => {
  try {
    console.log("📥 Received mentor-mentee conversation request:", req.body);
  
    const { mentorId, menteeId, moocChecked, projectChecked, conversationText, title, topic, semester, academicYear } = req.body;

    if (!mentorId || !menteeId || !conversationText || conversationText.length < 30) {
      console.log("❌ Validation failed:", { mentorId, menteeId, conversationTextLength: conversationText?.length });
      return res
        .status(400)
        .json({ message: "Mentor, Mentee, and valid conversation text (min 30 chars) required" });
    }
    const existingCount = await Conversation.countDocuments({
      mentorId,
      menteeId,
      semester: Number(semester),
      academicYear,
      isOffline: true,
    });
    if (existingCount >= 2) {
      return res.status(400).json({
        message: "Only 2 offline conversations allowed per semester",
      });
    }

    // Import generateSummary
    const { generateSummary } = await import("../services/summaryService.js");

    // Create a mock thread object for Gemini summary generation
    const mockThread = {
      _id: `offline_${Date.now()}`,
      topic: topic || "Offline Mentorship",
      title: title || "Offline Conversation",
      participants: [
        { _id: mentorId, name: "Mentor", roleName: "faculty" },
        { _id: menteeId, name: "Mentee", roleName: "student" }
      ],
      messages: [
        {
          senderId: mentorId,
          body: conversationText
        }
      ]
    };

    console.log("🤖 Generating AI summary for conversation...");
    const aiGeneratedSummary = await generateSummary(mockThread);
    console.log("✅ AI Summary generated (length:", aiGeneratedSummary?.length, ")");
    console.log("📝 Summary preview:", aiGeneratedSummary?.substring(0, 100));

    // Create conversation with all details and AI summary
    const conversationData = {
      conversationId: `mentor-mentee-${Date.now()}`,
      mentorId,
      menteeId,
      semester: Number(semester),
      academicYear: academicYear || "2025-26",
      title: title || "Offline Conversation",
      topic: topic || "Offline Mentorship",
      conversationText,
      description: aiGeneratedSummary || "", // Save AI summary as description
      summary: aiGeneratedSummary || "", // Also save in summary field for backward compatibility
      moocChecked: moocChecked || false,
      projectChecked: projectChecked || false,
      status: "closed",
      isOffline: true,
      date: new Date()
    };

    console.log("💾 Saving conversation to database with data:", {
      conversationId: conversationData.conversationId,
      mentorId: conversationData.mentorId,
      menteeId: conversationData.menteeId,
      title: conversationData.title,
      topic: conversationData.topic,
      conversationTextLength: conversationData.conversationText?.length,
      descriptionLength: conversationData.description?.length,
      moocChecked: conversationData.moocChecked,
      projectChecked: conversationData.projectChecked,
      status: conversationData.status,
      isOffline: conversationData.isOffline
    });

    const newMentorMenteeConv = new Conversation(conversationData);
    const savedConv = await newMentorMenteeConv.save();
  
    console.log("✅ Conversation saved successfully to database!");
    console.log("📊 Saved document:", savedConv);
  
    res.status(201).json({
      message: "Mentor–Mentee conversation saved successfully with AI summary",
      data: {
        conversation: savedConv,
        aiSummary: aiGeneratedSummary // Return for frontend display
      }
    });
  } catch (err) {
    console.error("❌ Error creating mentor–mentee conversation:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({
      message: "Error creating mentor–mentee conversation",
      error: err.message
    });
  }
});

// ✅ Create new conversation for a user
router.post("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      conversationId: req.params.userId,
    });

    if (conversation) {
      return res.status(400).json({ message: "Conversation already exists" });
    }

    const newConversation = new Conversation({
      conversationId: req.params.userId,
      status: "active",
    });

    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ New route: Mentor–Mentee Offline Conversation with Gemini Summary
// IMPORTANT: This must come BEFORE /:userId routes to avoid route conflicts
router.post("/mentor-mentee", async (req, res) => {
 try {
   console.log("📥 Received mentor-mentee conversation request:", req.body);
  
   const { mentorId, menteeId, moocChecked, projectChecked, conversationText, title, topic } = req.body;


   if (!mentorId || !menteeId || !conversationText || conversationText.length < 30) {
     console.log("❌ Validation failed:", { mentorId, menteeId, conversationTextLength: conversationText?.length });
     return res
       .status(400)
       .json({ message: "Mentor, Mentee, and valid conversation text (min 30 chars) required" });
   }
   const existingCount = await Conversation.countDocuments({
     mentorId,
     menteeId,
     semester: Number(semester),
     academicYear,
     isOffline: true,
   });
   if (existingCount >= 2) {
     return res.status(400).json({
       message: "Only 2 offline conversations allowed per semester",
     });
   }


   // Import generateSummary
   const { generateSummary } = await import("../services/summaryService.js");


   // Create a mock thread object for Gemini summary generation
   const mockThread = {
     _id: `offline_${Date.now()}`,
     topic: topic || "Offline Mentorship",
     title: title || "Offline Conversation",
     participants: [
       { _id: mentorId, name: "Mentor", roleName: "faculty" },
       { _id: menteeId, name: "Mentee", roleName: "student" }
     ],
     messages: [
       {
         senderId: mentorId,
         body: conversationText
       }
     ]
   };


   console.log("🤖 Generating AI summary for conversation...");
   const aiGeneratedSummary = await generateSummary(mockThread);
   console.log("✅ AI Summary generated (length:", aiGeneratedSummary?.length, ")");
   console.log("📝 Summary preview:", aiGeneratedSummary?.substring(0, 100));


   // Create conversation with all details and AI summary
   const conversationData = {
     conversationId: `mentor-mentee-${Date.now()}`,
     mentorId,
     menteeId,
     semester: Number(semester),
     academicYear: academicYear || "2025-26",
     title: title || "Offline Conversation",
     topic: topic || "Offline Mentorship",
     conversationText,
     description: aiGeneratedSummary || "", // Save AI summary as description
     summary: aiGeneratedSummary || "", // Also save in summary field for backward compatibility
     moocChecked: moocChecked || false,
     projectChecked: projectChecked || false,
     status: "closed",
     isOffline: true,
     date: new Date()
   };


   console.log("💾 Saving conversation to database with data:", {
     conversationId: conversationData.conversationId,
     mentorId: conversationData.mentorId,
     menteeId: conversationData.menteeId,
     title: conversationData.title,
     topic: conversationData.topic,
     conversationTextLength: conversationData.conversationText?.length,
     descriptionLength: conversationData.description?.length,
     moocChecked: conversationData.moocChecked,
     projectChecked: conversationData.projectChecked,
     status: conversationData.status,
     isOffline: conversationData.isOffline
   });


   const newMentorMenteeConv = new Conversation(conversationData);
   const savedConv = await newMentorMenteeConv.save();
  
   console.log("✅ Conversation saved successfully to database!");
   console.log("📊 Saved document:", savedConv);
  
   res.status(201).json({
     message: "Mentor–Mentee conversation saved successfully with AI summary",
     data: {
       conversation: savedConv,
       aiSummary: aiGeneratedSummary // Return for frontend display
     }
   });
 } catch (err) {
   console.error("❌ Error creating mentor–mentee conversation:", err);
   console.error("❌ Error stack:", err.stack);
   res.status(500).json({
     message: "Error creating mentor–mentee conversation",
     error: err.message
   });
 }
});


// ✅ Create new conversation for a user
router.post("/:userId", async (req, res) => {
 try {
   const conversation = await Conversation.findOne({
     conversationId: req.params.userId,
   });


   if (conversation) {
     return res.status(400).json({ message: "Conversation already exists" });
   }


   const newConversation = new Conversation({
     conversationId: req.params.userId,
     status: "active",
   });


   const savedConversation = await newConversation.save();
   res.status(200).json(savedConversation);
 } catch (err) {
   res.status(500).json(err);
 }
});


>>>>>>> pr-36
// ✅ Get conversation of a specific user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      conversationId: req.params.userId,
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


export default router;


