/**
 * QUICK TEST DATA INSERTION GUIDE
 * USN: 1CR24IS069
 * 
 * Copy and paste these queries directly into MongoDB
 */

// ============================================================
// STEP 1: FIND THE USER ID FOR USN 1CR24IS069
// ============================================================
// Run this in MongoDB Shell/Compass first:

db.studentprofiles.findOne({ usn: "1CR24IS069" })

// This will return something like:
// {
//   _id: ObjectId("..."),
//   usn: "1CR24IS069",
//   ... other fields
// }

// Copy the _id value (it looks like: 65a3b2c1d4e5f6g7h8i9j0k1)
// You will use this in STEP 2 below

// ============================================================
// STEP 2: INSERT VTU RESULTS DATA
// ============================================================
// Replace "PASTE_USER_ID_HERE" with the copied _id value
// Then run this entire query:

db.vturesults.insertOne({
  userId: ObjectId("PASTE_USER_ID_HERE"),
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
  lastUpdated: new Date(),
  fetchedFrom: "manual",
  createdAt: new Date(),
  updatedAt: new Date()
})

// ============================================================
// STEP 3: VERIFY THE DATA WAS INSERTED
// ============================================================
// Run these verification queries:

// View all VTU results for this USN:
db.vturesults.findOne({ usn: "1CR24IS069" })

// View only key fields:
db.vturesults.findOne({ usn: "1CR24IS069" }, { usn: 1, cgpa: 1, "semesters.semesterNumber": 1, "semesters.sgpa": 1 })

// View Semester 1 details:
db.vturesults.findOne({ usn: "1CR24IS069" }).semesters[0]

// ============================================================
// OPTIONAL: DIFFERENT PERFORMANCE LEVELS FOR TESTING
// ============================================================

// For testing AVERAGE performance (CGPA 6.0):
// Change cgpa to 6.0 and modify some grades to B/C

// For testing GOOD performance (CGPA 7.0):
// Change cgpa to 7.0 and adjust grades

// For testing BELOW PASSING (CGPA 4.5):
// Change cgpa to 4.5 and set some grades to F
