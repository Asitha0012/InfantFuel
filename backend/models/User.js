import mongoose from "mongoose";

const babyDetailsSchema = mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  birthWeight: { type: String, required: true },
  birthHeight: { type: String, default: null },
  bloodGroup: { type: String, default: null },
  profilePicture: { type: String, default: null },
});

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    userType: {
      type: String,
      required: true,
      enum: ["parent", "healthcareProvider"],
    },

    address: {
      type: String,
      required: function () {
        return this.userType === "parent";
      },
    },

    contactNumber: {
      type: String,
      required: function () {
        return this.userType === "parent" || this.userType === "healthcareProvider";
      },
    },

    babyDetails: {
      type: babyDetailsSchema,
      required: function () {
        return this.userType === "parent";
      },
    },

    workplaceAddress: {
      type: String,
      required: function () {
        return this.userType === "healthcareProvider";
      },
    },

    district: {
      type: String,
      required: function () {
        return this.userType === "healthcareProvider";
      },
    },

    gramaNiladhariDivision: {
      type: String,
      required: function () {
        return this.userType === "healthcareProvider";
      },
    },

    position: {
      type: String,
      required: function () {
        return this.userType === "healthcareProvider";
      },
    },

    professionalRegistrationNumber: {
      type: String,
      required: function () {
        return this.userType === "healthcareProvider";
      },
    },

    profilePicture: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;