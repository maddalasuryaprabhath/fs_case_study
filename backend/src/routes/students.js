import express from "express";
import Student from "../models/Student.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// RUBRIC COMPONENT 4: AGGREGATIONS & INDEX-AWARE STATS
// -------------------------------------------------------------
router.get("/analytics/stats", authenticate, async (_req, res) => {
  try {
    // 1. Department-wise count, average GPA, total tuition fee value
    const deptStats = await Student.aggregate([
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          avgGpa: { $avg: "$gpa" },
          totalTuition: { $sum: "$tuitionFee" },
          minGpa: { $min: "$gpa" },
          maxGpa: { $max: "$gpa" }
        }
      },
      {
        $project: {
          department: "$_id",
          studentCount: 1,
          avgGpa: { $round: ["$avgGpa", 2] },
          totalTuition: 1,
          minGpa: { $round: ["$minGpa", 2] },
          maxGpa: { $round: ["$maxGpa", 2] },
          _id: 0
        }
      },
      { $sort: { studentCount: -1 } }
    ]);

    // 2. Overall KPI metrics
    const totalStudents = await Student.countDocuments();
    const overallStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$tuitionFee" },
          collegeAvgGpa: { $avg: "$gpa" }
        }
      }
    ]);

    // 3. Fee collection status distribution
    const feeStatusStats = await Student.aggregate([
      {
        $group: {
          _id: "$feeStatus",
          count: { $sum: 1 },
          collectedAmount: { $sum: "$tuitionFee" }
        }
      }
    ]);

    res.json({
      totalStudents,
      collegeAvgGpa: overallStats[0]?.collegeAvgGpa ? Number(overallStats[0].collegeAvgGpa.toFixed(2)) : 0,
      totalRevenue: overallStats[0]?.totalRevenue || 0,
      departmentWise: deptStats,
      feeStatusWise: feeStatusStats
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate aggregation metrics", error: error.message });
  }
});

// -------------------------------------------------------------
// RUBRIC COMPONENT 3 & Q4(b): RETRIEVE ALL STUDENTS (WITH SEARCH & FILTER)
// -------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const { q, department, feeStatus } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { registrationNumber: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ];
    }

    if (department && department !== "All") {
      filter.department = department;
    }

    if (feeStatus && feeStatus !== "All") {
      filter.feeStatus = feeStatus;
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Single student lookup
router.get("/:registrationNumber", authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({
      registrationNumber: req.params.registrationNumber.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------------------------------------------------------------
// RUBRIC COMPONENT 3 & Q4(a): INSERT A STUDENT RECORD (CREATE)
// -------------------------------------------------------------
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { registrationNumber, name, department, email, semester, gpa, tuitionFee, feeStatus } = req.body;

    if (!registrationNumber || !name || !department) {
      return res.status(400).json({
        message: "Registration number, name, and department are required fields."
      });
    }

    const existing = await Student.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase()
    });

    if (existing) {
      return res.status(409).json({
        message: `Student with Registration Number ${registrationNumber.toUpperCase()} already exists.`
      });
    }

    const newStudent = await Student.create({
      registrationNumber: registrationNumber.trim().toUpperCase(),
      name: name.trim(),
      department: department.trim(),
      email: email ? email.trim().toLowerCase() : "",
      semester: semester ? Number(semester) : 1,
      gpa: gpa !== undefined ? Number(gpa) : 8.0,
      tuitionFee: tuitionFee !== undefined ? Number(tuitionFee) : 50000,
      feeStatus: feeStatus || "Paid",
      createdAt: new Date()
    });

    res.status(201).json({
      message: "Student record inserted successfully",
      student: newStudent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -------------------------------------------------------------
// RUBRIC COMPONENT 3 & Q4(c): UPDATE STUDENT / DEPARTMENT (UPDATE)
// -------------------------------------------------------------
router.put("/:registrationNumber", authenticate, authorize("admin"), async (req, res) => {
  try {
    const regNo = req.params.registrationNumber.toUpperCase();
    const updateData = { ...req.body };

    // Prevent overwriting registrationNumber with bad format
    if (updateData.registrationNumber) {
      updateData.registrationNumber = updateData.registrationNumber.toUpperCase();
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { registrationNumber: regNo },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student record not found." });
    }

    res.json({
      message: "Student record updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Specific endpoint matching Q4(c): update department only
router.patch("/:registrationNumber/department", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ message: "Department field is required." });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { registrationNumber: req.params.registrationNumber.toUpperCase() },
      { $set: { department: department.trim() } },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student record not found." });
    }

    res.json({
      message: "Student department updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -------------------------------------------------------------
// RUBRIC COMPONENT 3 & Q4(d): DELETE A STUDENT RECORD (DELETE)
// -------------------------------------------------------------
router.delete("/:registrationNumber", authenticate, authorize("admin"), async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({
      registrationNumber: req.params.registrationNumber.toUpperCase()
    });

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student record not found." });
    }

    res.json({
      message: "Student record deleted successfully",
      deletedStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
