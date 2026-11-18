import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../models/Student.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collegeDB";

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Clear existing student records
    await Student.deleteMany({});
    console.log("Cleared existing student collection.");

    // 2. Initial Sample Students from Case Study & Additional Departments
    const sampleStudents = [
      {
        registrationNumber: "A24126552094",
        name: "M. Surya Prabhath",
        department: "CSE (AI&ML)",
        email: "surya.prabhath@anits.edu.in",
        semester: 4,
        gpa: 9.25,
        tuitionFee: 75000,
        feeStatus: "Paid"
      },
      {
        registrationNumber: "A24126552001",
        name: "A. Aarav Sharma",
        department: "CSE",
        email: "aarav.sharma@anits.edu.in",
        semester: 4,
        gpa: 8.70,
        tuitionFee: 70000,
        feeStatus: "Paid"
      },
      {
        registrationNumber: "A24126552045",
        name: "K. Bhavya Sri",
        department: "ECE",
        email: "bhavya.sri@anits.edu.in",
        semester: 4,
        gpa: 8.90,
        tuitionFee: 65000,
        feeStatus: "Paid"
      },
      {
        registrationNumber: "A24126552088",
        name: "R. Sai Teja",
        department: "IT",
        email: "sai.teja@anits.edu.in",
        semester: 4,
        gpa: 7.95,
        tuitionFee: 65000,
        feeStatus: "Pending"
      },
      {
        registrationNumber: "A24126552112",
        name: "P. Divya Reddy",
        department: "CSE (Data Science)",
        email: "divya.reddy@anits.edu.in",
        semester: 4,
        gpa: 9.10,
        tuitionFee: 75000,
        feeStatus: "Paid"
      },
      {
        registrationNumber: "A24126552033",
        name: "V. Harish Kumar",
        department: "Mechanical",
        email: "harish.kumar@anits.edu.in",
        semester: 4,
        gpa: 7.80,
        tuitionFee: 60000,
        feeStatus: "Partial"
      }
    ];

    await Student.insertMany(sampleStudents);
    console.log(`Successfully seeded ${sampleStudents.length} student records.`);

    // 3. Ensure Default Admin exists
    const adminEmail = "admin@college.edu";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "College Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      console.log("Created default Admin account: admin@college.edu / admin123");
    }

    // 4. Ensure Default Student User exists
    const studentUserEmail = "surya.prabhath@anits.edu.in";
    const existingStudentUser = await User.findOne({ email: studentUserEmail });
    if (!existingStudentUser) {
      const hashedPassword = await bcrypt.hash("student123", 10);
      await User.create({
        name: "M. Surya Prabhath",
        email: studentUserEmail,
        password: hashedPassword,
        role: "student"
      });
      console.log("Created default Student account: surya.prabhath@anits.edu.in / student123");
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
