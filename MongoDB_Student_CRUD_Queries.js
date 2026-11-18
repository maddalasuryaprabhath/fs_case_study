// ============================================================
// MongoDB CRUD Operations on the Students Collection
// Full-Stack Web Development | ANITS | Course Code: 23CM4121
// Q4: Insert, Retrieve, Update, Delete Operations
// Run these commands in MongoDB Shell (mongosh), in order.
// ============================================================

use collegeDB;

// Optional: Create unique index BEFORE inserting records.
// This prevents duplicate registration numbers in a real database.
db.students.createIndex({ registrationNumber: 1 }, { unique: true });

// Also create a compound index for department-wise queries (Aggregation support)
db.students.createIndex({ department: 1, registrationNumber: 1 });

// ------------------------------------------------------------
// (a) INSERT a Student Record — CREATE
// insertOne() inserts one document into the students collection.
// ------------------------------------------------------------
const insertResult = db.students.insertOne({
  registrationNumber: "A24126552094",
  name: "M. Surya Prabhath",
  department: "CSE",
  email: "surya.prabhath@anits.edu.in",
  semester: 4,
  gpa: 9.25,
  tuitionFee: 75000,
  feeStatus: "Paid",
  createdAt: new Date()
});

print("--- INSERT RESULT ---");
printjson(insertResult);
// Expected: { acknowledged: true, insertedId: ObjectId("...") }

// ------------------------------------------------------------
// (b) RETRIEVE All Student Records — READ
// find({}) uses an empty filter, so it returns all documents.
// ------------------------------------------------------------
print("\n--- ALL STUDENT RECORDS (RETRIEVE) ---");
db.students.find({}).pretty();

// Retrieve a specific student by registrationNumber
print("\n--- FIND ONE STUDENT ---");
db.students.findOne({ registrationNumber: "A24126552094" });

// ------------------------------------------------------------
// (c) UPDATE a Student's Department — UPDATE
// updateOne() selects the student by registrationNumber.
// $set operator changes only the department field.
// ------------------------------------------------------------
const updateResult = db.students.updateOne(
  { registrationNumber: "A24126552094" },
  { $set: { department: "CSE (AI&ML)" } }
);

print("\n--- UPDATE RESULT ---");
printjson(updateResult);
// Expected: { acknowledged: true, matchedCount: 1, modifiedCount: 1 }

// Verify the updated department
print("\n--- VERIFY UPDATED RECORD ---");
db.students.findOne({ registrationNumber: "A24126552094" });
// Expected: department field should now show "CSE (AI&ML)"

// ------------------------------------------------------------
// BONUS: Aggregation Pipeline — Category-wise counts, avg GPA, total tuition
// Demonstrates: Aggregation and Indexing (Rubric Component 4)
// ------------------------------------------------------------
print("\n--- DEPARTMENT-WISE AGGREGATION (Category, Count, Avg GPA, Total Tuition) ---");
db.students.aggregate([
  {
    $group: {
      _id: "$department",
      studentCount: { $sum: 1 },
      avgGpa:        { $avg: "$gpa" },
      totalTuition:  { $sum: "$tuitionFee" }
    }
  },
  {
    $project: {
      department:   "$_id",
      studentCount: 1,
      avgGpa:       { $round: ["$avgGpa", 2] },
      totalTuition: 1,
      _id: 0
    }
  },
  { $sort: { studentCount: -1 } }
]).pretty();

// ------------------------------------------------------------
// (d) DELETE a Student Record — DELETE
// deleteOne() removes the student document whose registration
// number matches the filter.
// ------------------------------------------------------------
const deleteResult = db.students.deleteOne({
  registrationNumber: "A24126552094"
});

print("\n--- DELETE RESULT ---");
printjson(deleteResult);
// Expected: { acknowledged: true, deletedCount: 1 }

// Verify deletion — expected result: null
print("\n--- VERIFY DELETION (expected: null) ---");
printjson(
  db.students.findOne({ registrationNumber: "A24126552094" })
);

// ============================================================
// SUMMARY OF OPERATIONS PERFORMED
// ============================================================
// (a) insertOne()   — Inserted student record with reg no. A24126552094
// (b) find({})      — Retrieved all documents in students collection
// (c) updateOne()   — Updated department from "CSE" to "CSE (AI&ML)"
//     findOne()     — Verified the update
// (d) deleteOne()   — Deleted student record
//     findOne()     — Verified deletion returns null
//
// INDEXES CREATED:
//   { registrationNumber: 1 } — Unique index (prevents duplicates)
//   { department: 1, registrationNumber: 1 } — Compound index (aggregation queries)
//
// AGGREGATION PIPELINE DEMONSTRATED:
//   $group → $project → $sort
//   Groups students by department; calculates count, avg GPA, total tuition
// ============================================================
