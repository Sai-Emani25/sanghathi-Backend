import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Role from "../models/Role.js";
import logger from "../utils/logger.js";
import bcrypt from "bcrypt";
import { encrypt, compare } from "../utils/passwordHelper.js";
import mongoose from "mongoose";
import { createHash } from "crypto";


// Get all users with optional role filtering
export const getAllUsers = catchAsync(async (req, res, next) => {
  const { role } = req.query;
  let filter = {};

  // If a role is provided in the query, filter by role
  if (role) {
    const roleDoc = await Role.findOne({ name: role });

    // If no valid role is found, throw an error
    if (!roleDoc) {
      return next(new AppError("Invalid role", 400));
    }

    // Update filter to match the role ID
    filter.role = roleDoc._id;
  }

  // Get all users with profile data
  const users = await User.find(filter)
    .populate("role")
    .lean();

  if (users.length === 0) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: {
        users: [],
      },
    });
  }

  // Get all user IDs
  const userIds = users.map(user => user._id);
  
  // Fetch student profiles
  const studentProfiles = await mongoose.model('StudentProfile').find({ 
    userId: { $in: userIds } 
  }).lean();
  
  // Fetch faculty profiles
  const facultyProfiles = await mongoose.model('FacultyProfile').find({ 
    userId: { $in: userIds } 
  }).lean();
  
  // Create maps for quick lookup
  const studentProfileMap = {};
  studentProfiles.forEach(profile => {
    studentProfileMap[profile.userId.toString()] = profile;
  });
  
  const facultyProfileMap = {};
  facultyProfiles.forEach(profile => {
    facultyProfileMap[profile.userId.toString()] = profile;
  });
  
  // Enhance user objects with profile data
  const enhancedUsers = users.map(user => {
    const enhancedUser = { ...user };
    const studentProfile = studentProfileMap[user._id.toString()];
    const facultyProfile = facultyProfileMap[user._id.toString()];
    
    // Add profile data based on role
    if (user.roleName === 'student' && studentProfile) {
      enhancedUser.department = studentProfile.department;
      enhancedUser.sem = studentProfile.sem;
      enhancedUser.usn = studentProfile.usn;
    } else if (user.roleName === 'faculty' && facultyProfile) {
      enhancedUser.department = facultyProfile.department;
      enhancedUser.cabin = facultyProfile.cabin;
    }
    
    return enhancedUser;
  });

  return res.status(200).json({
    status: "success",
    results: enhancedUsers.length,
    data: {
      users: enhancedUsers,
    },
  });
});

// Get user by ID (not yet implemented, could return an error or be defined later)
export function getUser(req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!!",
  });
}

// Create a new user
export async function createUser(req, res, next) {
  try {
    console.log("Received Data:", req.body); // Debugging log

    const { name, email, phone, avatar, role, roleName, profile, password, passwordConfirm } = req.body;

    if (!roleName) {
      return next(new AppError("roleName is required but not provided", 400));
    }

    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return next(new AppError("Invalid role ID", 400));
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      avatar,
      role,
      roleName,
      profile,
      password,
      passwordConfirm,
    });

    // Ensure password is not sent in the response
    newUser.password = undefined;

    res.status(201).json({
      status: "success",
      _id: newUser._id,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.error("Error in createUser:", err);
    next(new AppError(err.message || "Error creating user", 500));
  }
}

// Update user details
export const updateUser = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;
  const { role, profileId } = req.body; // Extract profileId

  let updateData = { ...req.body };

  // If role is being updated, fetch the new role name
  if (role) {
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return next(new AppError("Invalid role ID", 400));
    }
    updateData.roleName = roleDoc.name; // Update roleName in DB
  }

  // Ensure profileId gets updated
  if (profileId) {
    updateData.profile = profileId;
  }

  // Update user details
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    runValidators: true,
    new: true,
  });

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});


// Delete a user
export const deleteUser = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;

  // Delete the user by ID
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return next(new AppError("User not found", 404));
  }

  // Log the successful deletion of the user
  logger.info("User deleted successfully", { userId });

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
});

//Get User by USN
export const getUserByUSN = async (req, res) => {
  try {
    const { usn } = req.params;
    
    // First, find the student profile with this USN
    const StudentProfile = mongoose.model("StudentProfile");
    const studentProfile = await StudentProfile.findOne({ usn });
    
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile with this USN not found" });
    }
    
    // Find the user associated with this profile - using the userId field in the StudentProfile
    const user = await User.findById(studentProfile.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User associated with this USN not found" });
    }
    
    res.json({ userId: user._id });
  } catch (error) {
    console.error("Error in getUserByUSN:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = catchAsync(async (req, res, next) => {
  try {
    const { currentPassword, newPassword, passwordConfirm, userId } = req.body;

    // Check if passwords match
    if (newPassword !== passwordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }

    // Find user by ID and select password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Verify current password using the user's method
    const isPasswordValid = await user.checkPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(new AppError("Current password is incorrect", 400));
    }

    // Update password (the pre-save middleware will handle hashing)
    user.password = newPassword;
    user.passwordConfirm = passwordConfirm; // Add passwordConfirm field
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const resetPasswordWithToken = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  const user = await User.findOne({
    passwordResetToken: createHash("sha256").update(req.params.token).digest("hex"),
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successful",
  });
});
