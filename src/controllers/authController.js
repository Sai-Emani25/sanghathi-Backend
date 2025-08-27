import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import StudentProfile from "../models/Student/Profile.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";
import { compare } from "../utils/passwordHelper.js";
import { createHash } from "crypto";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true, // Prevent access by client-side JavaScript
};

if (process.env.NODE_ENV === "production") {
  cookieOptions.secure = true;
}

// Generate and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, cookieOptions);

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Signup
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, roleName, phone, semester, firstName, lastName, ...studentData } = req.body;

  // Validate roleName is provided
  if (!roleName) {
    return next(new AppError("Role name is required", 400));
  }

  // Find the role based on its name (case insensitive)
  const role = await Role.findOne({ name: roleName.toLowerCase() });
  if (!role) {
    return next(new AppError("Invalid role", 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role: role._id,
    roleName: role.name, // Use the exact role name from the database
    phone // Add phone number to User model
  });

  // If the user is a student, create a student profile
  if (roleName.toLowerCase() === "student") {
    // Validate required student fields
    if (!semester) {
      return next(new AppError("Semester is required for student registration", 400));
    }

    // Get first and last name - use provided or extract from full name
    let firstNameToUse = firstName;
    let lastNameToUse = lastName;
    
    if (!firstName || !lastName) {
      const nameParts = name.split(" ");
      firstNameToUse = nameParts[0];
      lastNameToUse = nameParts.length > 1 ? nameParts.slice(1).join(" ") : firstNameToUse;
    }

    const studentProfileData = {
      userId: newUser._id,
      fullName: {
        firstName: firstNameToUse,
        lastName: lastNameToUse,
      },
      email: email,
      sem: semester,
      mobileNumber: phone, // Add phone number to StudentProfile model
      ...studentData
    };

    await StudentProfile.create(studentProfileData);
  }

  createSendToken(newUser, 201, res);
});

//create user
export const createUser = catchAsync(async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error); // Log the error details
    return next(new AppError("Failed to create user", 500));
  }
});

// Login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Find user and check password
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

// Protect middleware
export const protect = catchAsync(async (req, res, next) => {
  // 1) Check if the token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists
  const currentUser = await User.findById(decoded.id).populate("role");
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  next();
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role.name)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

// Forgot Password
// controllers/authController.js - Update forgotPassword function
export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // CHANGE THIS: Point to your React frontend, not the API
const resetURL = `${process.env.CLIENT_HOST}/resetPassword/${resetToken}`;
  
  // For production, use environment variables
  // const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Forgot your password? Click the link below to reset it:\n\n${resetURL}\n\nIf you didn't forget your password, please ignore this email.`;

  const htmlMessage = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${resetURL}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br>
    <p>Best regards,<br>Sanghathi Team</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message: message,
      html: htmlMessage
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!", 500)
    );
  }
});

// Reset Password
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // 2) Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in
  createSendToken(user, 200, res);
});

// Logout
export const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
};
