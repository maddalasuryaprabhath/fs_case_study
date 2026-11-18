import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true // Index creation for fast search
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      index: true
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1
    },
    gpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0
    },
    tuitionFee: {
      type: Number,
      min: 0,
      default: 50000
    },
    feeStatus: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Paid"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound Index for department-wise queries and performance
studentSchema.index({ department: 1, registrationNumber: 1 });

export default mongoose.model("Student", studentSchema);
