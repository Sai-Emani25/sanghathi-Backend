# VTU Results Test Data Setup Guide
## Testing the Dashboard Scorecard for USN: 1CR24IS069

## 📋 Prerequisites

- MongoDB instance running and connected
- Student profile exists with USN: `1CR24IS069`
- Both backend and frontend servers running

---

## 🚀 Quick Setup (3 Steps)

### STEP 1: Find the User ID

**Using MongoDB Compass (Recommended for Beginners):**
1. Open MongoDB Compass
2. Connect to your database
3. Go to: `sanghathi_db` → `studentprofiles` collection
4. Click the query icon (filter button)
5. Paste this filter:
   ```json
   { "usn": "1CR24IS069" }
   ```
6. Look for the `_id` field - it looks like: `65a3b2c1d4e5f6g7h8i9j0k1`
7. **Copy this full value** (including all characters)

**Using MongoDB Shell (mongosh):**
```bash
# Connect to MongoDB
mongosh

# Select database
use sanghathi_db

# Find the student
db.studentprofiles.findOne({ usn: "1CR24IS069" })

# Copy the _id value
```

---

### STEP 2: Insert VTU Results Data

**Using MongoDB Compass:**
1. Go to `sanghathi_db` → `vturesults` collection
2. Click **INSERT DOCUMENT** button (+)
3. A JSON editor will open
4. Paste this entire query and **replace** `PASTE_USER_ID_HERE` with the _id you copied:

```json
{
  "userId": ObjectId("PASTE_USER_ID_HERE"),
  "usn": "1CR24IS069",
  "semesters": [
    {
      "semesterNumber": 1,
      "examMonth": "June",
      "examYear": 2024,
      "courses": [
        {
          "courseCode": "CS101",
          "courseName": "Programming in C",
          "credits": 4,
          "internalMarks": 48,
          "externalMarks": 42,
          "totalMarks": 90,
          "grade": "O",
          "gradePoint": 10
        },
        {
          "courseCode": "CS102",
          "courseName": "Data Structures",
          "credits": 4,
          "internalMarks": 45,
          "externalMarks": 38,
          "totalMarks": 83,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS103",
          "courseName": "Digital Electronics",
          "credits": 4,
          "internalMarks": 42,
          "externalMarks": 35,
          "totalMarks": 77,
          "grade": "A",
          "gradePoint": 8
        },
        {
          "courseCode": "CS104",
          "courseName": "Physics",
          "credits": 3,
          "internalMarks": 40,
          "externalMarks": 32,
          "totalMarks": 72,
          "grade": "B+",
          "gradePoint": 7
        }
      ],
      "sgpa": 8.6,
      "fetchedAt": ISODate("2024-07-15T00:00:00Z")
    },
    {
      "semesterNumber": 2,
      "examMonth": "December",
      "examYear": 2024,
      "courses": [
        {
          "courseCode": "CS201",
          "courseName": "Database Management Systems",
          "credits": 4,
          "internalMarks": 46,
          "externalMarks": 40,
          "totalMarks": 86,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS202",
          "courseName": "Computer Architecture",
          "credits": 4,
          "internalMarks": 44,
          "externalMarks": 36,
          "totalMarks": 80,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS203",
          "courseName": "Discrete Mathematics",
          "credits": 4,
          "internalMarks": 43,
          "externalMarks": 37,
          "totalMarks": 80,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS204",
          "courseName": "Object Oriented Programming",
          "credits": 3,
          "internalMarks": 41,
          "externalMarks": 34,
          "totalMarks": 75,
          "grade": "A",
          "gradePoint": 8
        }
      ],
      "sgpa": 8.83,
      "fetchedAt": ISODate("2025-01-20T00:00:00Z")
    },
    {
      "semesterNumber": 3,
      "examMonth": "June",
      "examYear": 2025,
      "courses": [
        {
          "courseCode": "CS301",
          "courseName": "Operating Systems",
          "credits": 4,
          "internalMarks": 45,
          "externalMarks": 41,
          "totalMarks": 86,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS302",
          "courseName": "Web Technologies",
          "credits": 4,
          "internalMarks": 47,
          "externalMarks": 39,
          "totalMarks": 86,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS303",
          "courseName": "Algorithms",
          "credits": 4,
          "internalMarks": 46,
          "externalMarks": 38,
          "totalMarks": 84,
          "grade": "A+",
          "gradePoint": 9
        },
        {
          "courseCode": "CS304",
          "courseName": "Software Engineering",
          "credits": 3,
          "internalMarks": 42,
          "externalMarks": 33,
          "totalMarks": 75,
          "grade": "A",
          "gradePoint": 8
        }
      ],
      "sgpa": 8.83,
      "fetchedAt": ISODate("2025-02-15T00:00:00Z")
    }
  ],
  "cgpa": 8.77,
  "lastUpdated": ISODate("2025-02-25T00:00:00Z"),
  "fetchedFrom": "manual",
  "createdAt": ISODate("2024-06-01T00:00:00Z"),
  "updatedAt": ISODate("2025-02-25T00:00:00Z")
}
```

5. Click **INSERT** button
6. You should see: "Document successfully inserted"

**Using MongoDB Shell:**
```bash
db.vturesults.insertOne({
  userId: ObjectId("PASTE_YOUR_USER_ID_HERE"),
  usn: "1CR24IS069",
  semesters: [
    // ... paste the semesters array from the JSON above
  ],
  cgpa: 8.77,
  lastUpdated: new Date(),
  fetchedFrom: "manual",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

### STEP 3: Verify Data & Test Dashboard

**Verify in MongoDB:**
```javascript
// Check if data was inserted
db.vturesults.findOne({ usn: "1CR24IS069" })

// Should return the complete document with CGPA 8.77
```

**Test in Application:**

1. **Stop and restart your frontend server** (to clear any cached data)
   ```bash
   # In Terminal: esbuild
   Ctrl+C
   npm run dev
   ```

2. **Login to Sanghathi** with your student account

3. **Navigate to Student Dashboard** - You should see:
   - ✅ **VTU Results Card** displayed prominently
   - ✅ **CGPA: 8.77** (displayed in large text)
   - ✅ **Status: "Excellent"** (blue badge)
   - ✅ **Progress: 3 / 8** semesters
   - ✅ **Semester chips showing**:
     - Sem 1: 8.60
     - Sem 2: 8.83
     - Sem 3: 8.83

4. **Click "VTU Results" tile** to see full details

5. **Full Results Page should show**:
   ✅ All 3 semesters with courses
   ✅ Individual course marks and grades
   ✅ All calculated SGPA values
   ✅ Overall CGPA: 8.77

---

## 📊 Expected Test Results

### Summary
```
👤 Student: 1CR24IS069
📚 Program: Information Systems (IS)
🎓 Status: Excellent Performance
🏆 Classification: First Class with Distinction (CGPA ≥ 7.0)

Overall CGPA: 8.77 / 10
Semesters Completed: 3 / 8
Progress: 37.5% ✓

Semester Details:
├─ Semester 1 (June 2024): SGPA 8.60
├─ Semester 2 (Dec 2024): SGPA 8.83
└─ Semester 3 (June 2025): SGPA 8.83

Total Courses: 12
├─ Outstanding (O): 1 course
├─ Excellent (A+): 8 courses
├─ Good (A): 3 courses
├─ Above Average (B+): 1 course
├─ Average (B): 0 courses
├─ Below Average (C): 0 courses
├─ Pass (P): 0 courses
└─ Fail (F): 0 courses
```

### Dashboard Card Appearance

```
┌─────────────────────────────────┐
│ 🎓 VTU Results                  │
├─────────────────────────────────┤
│ USN: 1CR24IS069                 │
│                                 │
│ Current CGPA        Semesters   │
│ ┌──────────────┐   ┌──────────┐│
│ │    8.77      │   │   3 / 8  ││
│ │   /  10   ✓  │   │ ▓▓▓░░░░░░││
│ │ Excellent    │   │▓▓▓▓▓░    ││
│ └──────────────┘   └──────────┘│
│                                 │
│ Semester-wise SGPA              │
│ [Sem 1: 8.60] [Sem 2: 8.83]    │
│ [Sem 3: 8.83]                   │
│                                 │
│ Last Updated: 2025-02-25        │
│              [View All] button   │
└─────────────────────────────────┘
```

---

## ❌ Troubleshooting

### Issue: VTU Results Card shows "No Results Found"

**Solution:**
1. Verify userId is correct (must match exactly)
2. Check collection name is `vturesults` (case-sensitive)
3. Clear browser cache: `Ctrl+Shift+Delete` → Clear All
4. Log out and log back in
5. Refresh page with `Ctrl+F5` (hard refresh)

### Issue: "Failed to fetch VTU results" error

**Solution:**
1. Check backend server is running
2. Verify API endpoint responds: `GET /api/vtu-results/{userId}`
3. Check MongoDB connection
4. Look at browser console (F12) for detailed error

### Issue: CGPA showing as "NaN"

**Solution:**
1. Verify all courses have `credits` value
2. Ensure `gradePoint` is assigned for all courses
3. Check SGPA calculation: All courses need valid marks

### Issue: Grades showing as "undefined"

**Solution:**
1. Ensure `totalMarks` is calculated (internal + external)
2. Verify grade logic in `vtuResultsController.js`
3. Re-insert data if values are incomplete

---

## 🔄 Testing Other Scenarios

### Test Case 1: Average Performance (CGPA 6.0)

Change in STEP 2:
```json
"cgpa": 6.0,
```

And modify grades to:
- Some A, B+, B grades instead of O, A+

Expected: **"Good"** status badge (Amber color)

### Test Case 2: Below Passing (CGPA 4.5)

Change in STEP 2:
```json
"cgpa": 4.5,
```

And modify some grades to:
- Change some A+ to C or F

Expected: **"Below Passing"** status badge (Red color)

---

## ✅ Verification Checklist

After inserting data, verify:

- [ ] Data successfully inserted in MongoDB
- [ ] Backend API returns VTU results
- [ ] Dashboard card displays CGPA
- [ ] CGPA value is 8.77
- [ ] Status shows "Excellent"
- [ ] Semester progress shows 3/8
- [ ] Semester chips visible with correct SGPA values
- [ ] Click on "View All" navigates to full results page
- [ ] Full page shows all 3 semesters with courses
- [ ] Grade colors are correct (O=green, A+=blue, A=blue, B+=amber)
- [ ] No console errors
- [ ] Performance status badge color is blue (Excellent)

---

## 📞 Support

If data doesn't appear:
1. Check MongoDB directly for the document
2. Verify userId matches exactly
3. Look at browser Network tab to see API response
4. Check server logs for any errors
5. Restart both frontend and backend servers

---

**Last Updated:** February 25, 2026
