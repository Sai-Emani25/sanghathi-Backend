# IAT and VTU API Implementation Guide

## Overview
This guide documents the backend API implementation for Internal Assessment Test (IAT) and VTU (Visvesvaraya Technological University) Results templates in the Sanghathi application.

---

## 1. IAT (Internal Assessment Test) Endpoints

### Base URL
```
/api/students/Iat
```

### Authentication
All IAT endpoints require authentication using a Bearer token in the Authorization header.

```
Authorization: Bearer {token}
```

### Endpoints

#### 1.1 Get IAT Data for a User
**Endpoint:** `GET /:userId`

**Description:** Fetch all IAT records for a specific user

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Response:**
```json
{
  "status": "success",
  "data": {
    "iat": {
      "_id": "ObjectId",
      "userId": "ObjectId", 
      "semesters": [
        {
          "semester": 1,
          "subjects": [
            {
              "subjectCode": "CS101",
              "subjectName": "Programming in C",
              "iat1": "45",
              "iat2": "48",
              "avg": "46.5"
            }
          ]
        }
      ]
    }
  }
}
```

#### 1.2 Submit or Update IAT Data
**Endpoint:** `POST /:userId`

**Description:** Submit or update IAT marks for a student

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Request Body:**
```json
{
  "semester": 1,
  "subjects": [
    {
      "subjectCode": "CS101",
      "subjectName": "Programming in C",
      "iat1": "45",
      "iat2": "48",
      "avg": "46.5"
    },
    {
      "subjectCode": "CS102",
      "subjectName": "Data Structures",
      "iat1": "42",
      "iat2": "45",
      "avg": "43.5"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "iat": {
      "_id": "ObjectId",
      "userId": "ObjectId",
      "semesters": [
        {
          "semester": 1,
          "subjects": [...]
        }
      ]
    }
  }
}
```

#### 1.3 Delete All IAT Records
**Endpoint:** `DELETE /:userId`

**Description:** Delete all IAT records for a user

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Response:**
```json
{
  "status": "success",
  "message": "All IAT records deleted successfully",
  "deletedCount": 8
}
```

#### 1.4 Delete Specific Semester
**Endpoint:** `DELETE /:userId/semester/:semester`

**Description:** Delete IAT records for a specific semester

**Parameters:**
- `userId` (path): User ID (ObjectId)
- `semester` (path): Semester number (1-8)

**Response:**
```json
{
  "status": "success",
  "message": "Semester 1 deleted successfully",
  "data": {
    "iat": {...}
  }
}
```

#### 1.5 Delete Multiple Semesters
**Endpoint:** `POST /:userId/delete-semesters`

**Description:** Delete multiple semesters at once

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Request Body:**
```json
{
  "semesters": [1, 2, 3]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "3 semester(s) deleted successfully",
  "deletedSemesters": [1, 2, 3],
  "data": {
    "iat": {...}
  }
}
```

---

## 2. VTU (Results) Endpoints

### Base URL
```
/api/vtu-results
```

### Authentication
All VTU endpoints require authentication using a Bearer token in the Authorization header.

```
Authorization: Bearer {token}
```

### Endpoints

#### 2.1 Get All VTU Results for a Student
**Endpoint:** `GET /:userId`

**Description:** Fetch all VTU results (all semesters) for a student

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Response:**
```json
{
  "status": "success",
  "data": {
    "vtuResults": {
      "_id": "ObjectId",
      "userId": "ObjectId",
      "usn": "1CR24CS001",
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
            }
          ],
          "sgpa": 9.5
        }
      ],
      "cgpa": 8.8,
      "lastUpdated": "2024-06-15T10:30:00Z"
    }
  }
}
```

#### 2.2 Add or Update VTU Results
**Endpoint:** `POST /:userId`

**Description:** Add or update VTU results for a student

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Request Body:**
```json
{
  "usn": "1CR24CS001",
  "semesterData": [
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
          "externalMarks": 42
        },
        {
          "courseCode": "CS102",
          "courseName": "Data Structures",
          "credits": 4,
          "internalMarks": 45,
          "externalMarks": 38
        }
      ]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "vtuResults": {...}
  }
}
```

#### 2.3 Get VTU Results Summary (CGPA & Semester-wise SGPA)
**Endpoint:** `GET /:userId/summary`

**Description:** Get CGPA and semester-wise SGPA summary

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "usn": "1CR24CS001",
      "totalSemesters": 2,
      "cgpa": 8.8,
      "semesters": [
        {
          "semesterNumber": 1,
          "sgpa": 9.5,
          "courseCount": 4,
          "examMonth": "June",
          "examYear": 2024
        },
        {
          "semesterNumber": 2,
          "sgpa": 8.2,
          "courseCount": 4,
          "examMonth": "December",
          "examYear": 2024
        }
      ],
      "lastUpdated": "2024-06-15T10:30:00Z"
    }
  }
}
```

#### 2.4 Get Results for Specific Semester
**Endpoint:** `GET /:userId/semester/:semesterNumber`

**Description:** Get detailed results for a specific semester

**Parameters:**
- `userId` (path): User ID (ObjectId)
- `semesterNumber` (path): Semester number (1-8)

**Response:**
```json
{
  "status": "success",
  "data": {
    "semester": {
      "semesterNumber": 1,
      "examMonth": "June",
      "examYear": 2024,
      "courses": [...],
      "sgpa": 9.5
    }
  }
}
```

#### 2.5 Update Specific Semester Results
**Endpoint:** `PUT /:userId/semester/:semesterNumber`

**Description:** Update results for a specific semester

**Parameters:**
- `userId` (path): User ID (ObjectId)
- `semesterNumber` (path): Semester number (1-8)

**Request Body:**
```json
{
  "examMonth": "June",
  "examYear": 2024,
  "courses": [
    {
      "courseCode": "CS101",
      "courseName": "Programming in C",
      "credits": 4,
      "internalMarks": 48,
      "externalMarks": 42
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vtuResults": {...}
  }
}
```

#### 2.6 Delete All VTU Results
**Endpoint:** `DELETE /:userId`

**Description:** Delete all VTU results for a student

**Parameters:**
- `userId` (path): User ID (ObjectId)

**Response:**
```json
{
  "status": "success",
  "message": "VTU results deleted successfully"
}
```

#### 2.7 Fetch External Marks from VTU Official Portal
**Endpoint:** `POST /external/fetch`

**Description:** Fetch live external marks data directly from VTU's results portal

**Request Body:**
```json
{
  "usn": "1CR24CS001"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully fetched external marks for 2 semester(s)",
  "data": {
    "external": {
      "usn": "1CR24CS001",
      "semesters": [...],
      "fetchedAt": "2024-06-15T10:30:00Z",
      "source": "VTU Official Results Portal"
    }
  }
}
```

---

## 3. VTU Grading Scale

The VTU Results system uses the official VTU grading scale for all undergraduate engineering programs:

| Grade | Grade Point | Marks Range | Performance Level |
|-------|------------|------------|------------------|
| **O** | 10 | 90-100 | Outstanding |
| **A+** | 9 | 80-89 | Excellent |
| **A** | 8 | 70-79 | Good |
| **B+** | 7 | 60-69 | Above Average |
| **B** | 6 | 50-59 | Average |
| **C** | 5 | 40-49 | Below Average |
| **P** | 4 | 35-39 | Pass (Minimum) |
| **F** | 0 | <35 | Fail |

---

## 4. CGPA & SGPA Calculation

### SGPA (Semester Grade Point Average)
Calculated per semester using the formula:
```
SGPA = Σ(Grade Point × Credits) / Σ Credits
```

### CGPA (Cumulative Grade Point Average)
Calculated across all semesters using the formula:
```
CGPA = Σ(Grade Point × Credits) for all semesters / Σ Credits for all semesters
```

---

## 5. Database Models

### IAT Model (Admin/IatMarks.js)
```javascript
{
  userId: ObjectId (ref: User),
  semesters: [
    {
      semester: Number (1-8),
      subjects: [
        {
          subjectName: String,
          subjectCode: String,
          iat1: String (0-50),
          iat2: String (0-50),
          avg: String (0-50)
        }
      ]
    }
  ]
}
```

### VTU Results Model (Student/VTUResults.js)
```javascript
{
  userId: ObjectId (ref: User),
  usn: String,
  semesters: [
    {
      semesterNumber: Number (1-8),
      examMonth: String (January/June/December),
      examYear: Number,
      courses: [
        {
          courseCode: String,
          courseName: String,
          credits: Number,
          internalMarks: Number (0-50),
          externalMarks: Number (0-50),
          totalMarks: Number (0-100),
          grade: String (O/A+/A/B+/B/C/P/F),
          gradePoint: Number (0-10)
        }
      ],
      sgpa: Number (0-10)
    }
  ],
  cgpa: Number (0-10),
  fetchedFrom: String (manual/automated/eddts),
  lastUpdated: Date
}
```

---

## 6. Error Response Format

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **404**: Not Found
- **500**: Internal Server Error

---

## 7. Frontend Integration

### IAT Upload
- Frontend: `/pages/Admin/AddIat.jsx`
- Endpoint: `POST /api/students/Iat/{userId}`
- Data Structure: CSV format with columns: USN, Sem, SubjectCode, SubjectName, IAT1, IAT2, Avg

### IAT View
- Frontend: `/pages/Scorecard/Iat.jsx`
- Endpoint: `GET /api/students/Iat/{userId}`

### VTU Results
- Frontend: Scorecard page
- Endpoints: GET, POST, PUT, DELETE `/api/vtu-results/{userId}`

---

## 8. Testing

### Sample IAT Data
```json
{
  "semester": 1,
  "subjects": [
    {
      "subjectCode": "CS101",
      "subjectName": "Programming in C",
      "iat1": "45",
      "iat2": "48",
      "avg": "46.5"
    }
  ]
}
```

### Sample VTU Data
```json
{
  "usn": "1CR24CS001",
  "semesterData": [
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
          "externalMarks": 42
        }
      ]
    }
  ]
}
```
