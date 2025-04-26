import mongoose from "mongoose";
import Counter from "./counter.model.js";

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
	  validate: {
		validator: (v) => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
		message: (props) => `${props.value} is not a valid email!`,
	},
    },
    password: { type: String, required: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: { type: String },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    department: { type: String },
    phone: { type: String },
    location: { type: String },
    profileImage: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" }, // To enable/disable user
    permissions: [
      {
        type: String,
      },
    ], // Example: ["manage_tasks", "view_sales", "edit_projects"]
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    passwordChangedAt: Date, // Track password updates
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Track who created the user
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Track who last updated the user
    },
  },
  { timestamps: true }
);

// Add middleware to generate user_id
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "userId" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      
      // Ensure the sequence value is at least 1
      const sequenceValue = Math.max(counter.sequenceValue, 1);
      this.user_id = `UID${String(sequenceValue).padStart(9, '0')}`;
      
      // Verify uniqueness
      const existingUser = await this.constructor.findOne({ user_id: this.user_id });
      if (existingUser) {
        // If user_id exists, increment counter and try again
        await Counter.findOneAndUpdate(
          { _id: "userId" },
          { $inc: { sequenceValue: 1 } },
          { new: true }
        );
        this.user_id = `UID${String(sequenceValue + 1).padStart(9, '0')}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export const User = mongoose.model("User", userSchema);
