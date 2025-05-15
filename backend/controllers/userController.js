import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { userType, fullName, email, password, ...additionalFields } = req.body;

  if (!userType || !fullName || !email || !password) {
    throw new Error("Please fill all the required fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the user password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let newUser;

  if (userType === "parent") {
    const { address, contactNumber, babyDetails } = additionalFields;

    if (!address || !contactNumber || !babyDetails || !babyDetails.fullName || !babyDetails.dateOfBirth || !babyDetails.gender || !babyDetails.birthWeight) {
      throw new Error("Please fill all the required fields for parent registration");
    }

    newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      address,
      contactNumber,
      userType: "parent",
      isAdmin: false,
      babyDetails: {
        fullName: babyDetails.fullName,
        dateOfBirth: babyDetails.dateOfBirth,
        gender: babyDetails.gender,
        birthWeight: babyDetails.birthWeight,
        birthHeight: babyDetails.birthHeight || null,
        bloodGroup: babyDetails.bloodGroup || null,
        profilePicture: babyDetails.profilePicture || null,
      },
    });
  } else if (userType === "healthcareProvider") {
    const {
      workplaceAddress,
      contactNumber,
      district,
      gramaNiladhariDivision,
      position,
      professionalRegistrationNumber,
      profilePicture,
    } = additionalFields;

    if (
      !workplaceAddress ||
      !contactNumber ||
      !district ||
      !gramaNiladhariDivision ||
      !position ||
      !professionalRegistrationNumber
    ) {
      throw new Error("Please fill all the required fields for healthcare provider registration");
    }

    newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      workplaceAddress,
      district,
      gramaNiladhariDivision,
      contactNumber,
      position,
      professionalRegistrationNumber,
      userType: "healthcareProvider",
      isAdmin: true,
      profilePicture: profilePicture || null,
    });
  } else {
    throw new Error("Invalid user type");
  }

  try {
    await newUser.save();
    createToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      userType: newUser.userType,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordValid) {
      createToken(res, existingUser._id);

      res.status(201).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });
    } else {
      res.status(401).json({ message: "Invalid Password" });
    }
  } else {
    res.status(401).json({ message: "User not found" });
  }
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      contactNumber: user.contactNumber,
      address: user.address,
      babyDetails: user.babyDetails, // For parents
      profilePicture: user.profilePicture,
      userType: user.userType,
      workplaceAddress: user.workplaceAddress, // ADD THIS
      position: user.position,                 // ADD THIS
      professionalRegistrationNumber: user.professionalRegistrationNumber, // ADD THIS
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    if (user.userType === "parent") {
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address || user.address;

      if (user.babyDetails) {
        user.babyDetails.fullName = req.body.babyDetails?.fullName || user.babyDetails.fullName;
        user.babyDetails.dateOfBirth = req.body.babyDetails?.dateOfBirth || user.babyDetails.dateOfBirth;
        user.babyDetails.gender = req.body.babyDetails?.gender || user.babyDetails.gender;
        user.babyDetails.birthWeight = req.body.babyDetails?.birthWeight || user.babyDetails.birthWeight;
        user.babyDetails.birthHeight = req.body.babyDetails?.birthHeight || user.babyDetails.birthHeight;
        user.babyDetails.bloodGroup = req.body.babyDetails?.bloodGroup || user.babyDetails.bloodGroup;
        user.babyDetails.profilePicture = req.body.babyDetails?.profilePicture || user.babyDetails.profilePicture;
      }
    } else if (user.userType === "healthcareProvider") {
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address || user.address;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.workplaceAddress = req.body.workplaceAddress || user.workplaceAddress;
      user.position = req.body.position || user.position; // ADD THIS
      user.professionalRegistrationNumber = req.body.professionalRegistrationNumber || user.professionalRegistrationNumber; // ADD THIS
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      userType: updatedUser.userType,
      isAdmin: updatedUser.isAdmin,
      contactNumber: updatedUser.contactNumber,
      address: updatedUser.address,
      profilePicture: updatedUser.profilePicture,
      workplaceAddress: updatedUser.workplaceAddress, // ADD THIS
      position: updatedUser.position,                 // ADD THIS
      professionalRegistrationNumber: updatedUser.professionalRegistrationNumber, // ADD THIS
      ...(updatedUser.userType === "parent" && {
        babyDetails: updatedUser.babyDetails,
      }),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};