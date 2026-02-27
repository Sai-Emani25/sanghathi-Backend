/**
 * Sample VTU Results Test Data
 * USN: 1CR24IS069
 * 
 * This script can be run in:
 * 1. MongoDB Compass (paste in Query tab under Collection)
 * 2. MongoDB Shell (mongosh)
 * 3. Node.js script with MongoDB client
 */

// ============================================================
// SAMPLE DATA FOR TESTING VTU RESULTS
// ============================================================

// First, find or create a student user with this USN
// You need to get the actual userId from your StudentProfile collection

// STEP 1: Find the user ID for USN 1CR24IS069
// Run this query in MongoDB to find the user:
db.studentprofiles.findOne({ usn: "1CR24IS069" })
// This will return the userId that you need to use below

// STEP 2: Copy the userId and use it in the VTU Results document below
// Replace "USER_ID_HERE" with the actual MongoDB ObjectId

// Sample VTU Results Document
const sampleVTUResults = {
  userId: ObjectId("USER_ID_HERE"), // Replace with actual user ID
  usn: "1CR24IS069",
  semesters: [
    {
      semesterNumber: 1,
      examMonth: "June",
      examYear: 2024,
      courses: [
        {
          courseCode: "CS101",
          courseName: "Programming in C",
          credits: 4,
          internalMarks: 48,
          externalMarks: 42,
          totalMarks: 90,
          grade: "O",
          gradePoint: 10
        },
        {
          courseCode: "CS102",
          courseName: "Data Structures",
          credits: 4,
          internalMarks: 45,
          externalMarks: 38,
          totalMarks: 83,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS103",
          courseName: "Digital Electronics",
          credits: 4,
          internalMarks: 42,
          externalMarks: 35,
          totalMarks: 77,
          grade: "A",
          gradePoint: 8
        },
        {
          courseCode: "CS104",
          courseName: "Physics",
          credits: 3,
          internalMarks: 40,
          externalMarks: 32,
          totalMarks: 72,
          grade: "B+",
          gradePoint: 7
        }
      ],
      sgpa: 8.6,
      fetchedAt: new Date("2024-07-15")
    },
    {
      semesterNumber: 2,
      examMonth: "December",
      examYear: 2024,
      courses: [
        {
          courseCode: "CS201",
          courseName: "Database Management Systems",
          credits: 4,
          internalMarks: 46,
          externalMarks: 40,
          totalMarks: 86,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS202",
          courseName: "Computer Architecture",
          credits: 4,
          internalMarks: 44,
          externalMarks: 36,
          totalMarks: 80,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS203",
          courseName: "Discrete Mathematics",
          credits: 4,
          internalMarks: 43,
          externalMarks: 37,
          totalMarks: 80,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS204",
          courseName: "Object Oriented Programming",
          credits: 3,
          internalMarks: 41,
          externalMarks: 34,
          totalMarks: 75,
          grade: "A",
          gradePoint: 8
        }
      ],
      sgpa: 8.83,
      fetchedAt: new Date("2025-01-20")
    },
    {
      semesterNumber: 3,
      examMonth: "June",
      examYear: 2025,
      courses: [
        {
          courseCode: "CS301",
          courseName: "Operating Systems",
          credits: 4,
          internalMarks: 45,
          externalMarks: 41,
          totalMarks: 86,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS302",
          courseName: "Web Technologies",
          credits: 4,
          internalMarks: 47,
          externalMarks: 39,
          totalMarks: 86,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS303",
          courseName: "Algorithms",
          credits: 4,
          internalMarks: 46,
          externalMarks: 38,
          totalMarks: 84,
          grade: "A+",
          gradePoint: 9
        },
        {
          courseCode: "CS304",
          courseName: "Software Engineering",
          credits: 3,
          internalMarks: 42,
          externalMarks: 33,
          totalMarks: 75,
          grade: "A",
          gradePoint: 8
        }
      ],
      sgpa: 8.83,
      fetchedAt: new Date("2025-02-15")
    }
  ],
  cgpa: 8.77,
  lastUpdated: new Date("2025-02-25"),
  fetchedFrom: "manual",
  createdAt: new Date("2024-06-01"),
  updatedAt: new Date("2025-02-25")
};

// ============================================================
// TO INSERT THIS DATA, USE ONE OF THESE METHODS:
// ============================================================

/*

METHOD 1: MongoDB mongosh (Command Line)
==========================================
Connect to MongoDB:
  mongosh

Select database:
  use sanghathi_db  (or your database name)

First, find the actual user ID:
  db.studentprofiles.findOne({ usn: "1CR24IS069" })

Copy the userId value from the result.

Then insert the VTU results (replace USER_ID with actual ObjectId):
  db.vturesults.insertOne({
    userId: ObjectId("PASTE_USER_ID_HERE"),
    usn: "1CR24IS069",
    semesters: [
      // ... paste semesters array from above
    ],
    cgpa: 8.77,
    lastUpdated: new Date(),
    fetchedFrom: "manual",
    createdAt: new Date(),
    updatedAt: new Date()
  })


METHOD 2: MongoDB Compass (GUI)
================================
1. Connect to your MongoDB instance
2. Select database "sanghathi_db"
3. Find StudentProfile collection
4. Search for USN: { usn: "1CR24IS069" }
5. Copy the _id value
6. Go to VTUResults collection
7. Insert Document ("+")
8. Paste the sample data with userId set to the copied _id


METHOD 3: Using Node.js Script
================================
Create file: seed-vtu-data.js

const { MongoClient } = require('mongodb');

async function seedData() {
  const uri = 'mongodb+srv://username:password@cluster.mongodb.net/dbname';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('sanghathi_db');
    
    // Find user
    const studentProfile = await db.collection('studentprofiles')
      .findOne({ usn: "1CR24IS069" });
    
    if (!studentProfile) {
      console.error('Student profile not found');
      return;
    }
    
    // Insert VTU results
    const result = await db.collection('vturesults').insertOne({
      userId: studentProfile._id,
      usn: "1CR24IS069",
      semesters: [ /* paste semesters data */ ],
      cgpa: 8.77,
      lastUpdated: new Date(),
      fetchedFrom: "manual",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Data inserted:', result.insertedId);
  } finally {
    await client.close();
  }
}

seedData()

Run with: node seed-vtu-data.js

*/

// ============================================================
// VERIFICATION QUERIES
// ============================================================

/*

After inserting data, verify with these queries:

1. Find the VTU Results:
   db.vturesults.findOne({ usn: "1CR24IS069" })

2. Check CGPA calculation:
   db.vturesults.findOne({ usn: "1CR24IS069" }).cgpa

3. Get all semesters:
   db.vturesults.findOne({ usn: "1CR24IS069" }).semesters

4. Verify SGPA for Semester 1:
   db.vturesults.findOne({ usn: "1CR24IS069" }).semesters[0].sgpa

*/

// ============================================================
// EXPECTED TEST RESULTS
// ============================================================

/*

Student: 1CR24IS069

Overall CGPA: 8.77 ✓
- Semester 1: 8.6 SGPA (4 courses)
- Semester 2: 8.83 SGPA (4 courses)
- Semester 3: 8.83 SGPA (4 courses)

Grade Distribution:
- Outstanding (O): 1 course
- Excellent (A+): 11 courses
- Good (A): 4 courses

Performance Status: Excellent
Distinction: First Class with Distinction (CGPA ≥ 7.0)

Dashboard Card Should Show:
✓ USN: 1CR24IS069
✓ CGPA: 8.77 / 10
✓ Status: "Excellent"
✓ Semesters: 3 / 8
✓ Semester-wise SGPA chips visible
✓ Color coding: Blue (8.5-10 range)

*/
