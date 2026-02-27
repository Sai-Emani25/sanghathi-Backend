import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Fetch external marks from VTU RESULTS portal
 * VTU Updates results every 6 months for all 8 semesters
 * URL: https://results.vtu.ac.in/
 */

const VTU_RESULTS_BASE_URL = "https://results.vtu.ac.in";

/**
 * Fetch External Marks for a specific USN from VTU Official Portal
 * @param {string} usn - University Seat Number (e.g., 1CR24IS069)
 * @returns {Promise<Array>} - Array of semester results with external marks
 */
export const fetchVTUExternalMarks = async (usn) => {
  try {
    if (!usn || typeof usn !== "string") {
      throw new Error("Invalid USN provided");
    }

    const sanitizedUSN = usn.trim().toUpperCase();
    console.log(`Fetching external marks for USN: ${sanitizedUSN}`);

    // Create axios instance with timeout and headers
    const client = axios.create({
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // Try to fetch results from VTU results portal
    // The portal may have different endpoints for different semesters
    const semesters = [];

    // Fetch results for all 8 semesters
    for (let sem = 1; sem <= 8; sem++) {
      try {
        // Try multiple possible URLs that VTU might use
        const urls = [
          `${VTU_RESULTS_BASE_URL}/results/?sem=${sem}&usn=${sanitizedUSN}`,
          `${VTU_RESULTS_BASE_URL}/result/?sem=${sem}&usn=${sanitizedUSN}`,
          `${VTU_RESULTS_BASE_URL}/?semester=${sem}&usn=${sanitizedUSN}`,
          `${VTU_RESULTS_BASE_URL}/search?usn=${sanitizedUSN}&semester=${sem}`,
        ];

        let response = null;
        let foundUrl = null;

        for (const url of urls) {
          try {
            console.log(`Trying URL: ${url}`);
            response = await client.get(url);
            if (response.data) {
              foundUrl = url;
              break;
            }
          } catch (urlErr) {
            continue; // Try next URL
          }
        }

        if (response && response.data) {
          const semesterData = parseVTUResults(response.data, sem, sanitizedUSN);
          if (semesterData && semesterData.subjects.length > 0) {
            semesters.push(semesterData);
            console.log(
              `Successfully fetched semester ${sem} data (${semesterData.subjects.length} subjects)`
            );
          }
        }
      } catch (semError) {
        console.log(`No data found for semester ${sem}: ${semError.message}`);
        // Continue to next semester if one fails
      }
    }

    if (semesters.length === 0) {
      throw new Error(
        `No external marks data found for USN: ${sanitizedUSN}. Please ensure the USN is correct and results have been published by VTU.`
      );
    }

    return semesters;
  } catch (error) {
    console.error("Error fetching VTU external marks:", error.message);
    throw new Error(error.message || "Failed to fetch VTU external marks");
  }
};

/**
 * Parse VTU Results HTML page and extract semester data
 * @param {string} html - HTML content of the results page
 * @param {number} semesterNumber - Semester number
 * @param {string} usn - USN being fetched
 * @returns {Object} - Parsed semester data
 */
const parseVTUResults = (html, semesterNumber, usn) => {
  try {
    const $ = cheerio.load(html);
    const subjects = [];

    // Try different possible table structures
    const tables = $("table");

    if (tables.length === 0) {
      console.warn(`No tables found in HTML for semester ${semesterNumber}`);
      return { semester: semesterNumber, subjects: [] };
    }

    // Parse each table (usually one per semester)
    tables.each((tableIdx, table) => {
      const rows = $(table).find("tr");

      rows.each((rowIdx, row) => {
        if (rowIdx === 0) return; // Skip header

        const cells = $(row).find("td");
        if (cells.length < 4) return;

        const subjectCode = $(cells[0]).text().trim();
        const subjectName = $(cells[1]).text().trim();
        const externalMarks =
          parseInt($(cells[2]).text().trim()) ||
          parseInt($(cells[3]).text().trim()) ||
          null;
        const credits =
          parseInt($(cells[4]).text().trim()) ||
          parseInt($(cells[5]).text().trim()) ||
          4;
        const result = $(cells[6])?.text().trim() || "-";
        const grade = $(cells[7])?.text().trim() || "-";

        // Only add if we have essential data
        if (subjectCode && subjectName) {
          subjects.push({
            subjectCode,
            subjectName,
            externalMarks: externalMarks || "-",
            credits,
            result,
            grade,
            attempt: "1",
            passingDate: "-",
          });
        }
      });
    });

    // Calculate SGPA if we have subjects with marks and credits
    let sgpa = null;
    if (subjects.length > 0 && subjects.some((s) => typeof s.externalMarks === "number")) {
      sgpa = calculateSGPA(subjects);
    }

    return {
      semester: semesterNumber,
      sgpa: sgpa,
      subjects: subjects,
    };
  } catch (error) {
    console.error("Error parsing VTU results HTML:", error.message);
    return { semester: semesterNumber, subjects: [] };
  }
};

/**
 * Calculate SGPA from subjects
 * VTU SGPA = Sum(Credit * GradePoint) / Sum(Credit)
 */
const calculateSGPA = (subjects) => {
  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((subject) => {
    if (subject.externalMarks && typeof subject.externalMarks === "number") {
      const gradePoint = getGradePoint(subject.externalMarks);
      totalCredits += subject.credits || 4;
      totalPoints += (subject.credits || 4) * gradePoint;
    }
  });

  if (totalCredits === 0) return null;
  return (totalPoints / totalCredits).toFixed(2);
};

/**
 * Convert external marks to grade point (0-10)
 * VTU Grading Scale:
 * 90-100: O (10), 80-89: A+ (9), 70-79: A (8)
 * 60-69: B+ (7), 50-59: B (6), 40-49: C (5)
 * 35-39: P (4), <35: F (0)
 */
const getGradePoint = (marks) => {
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 50) return 6;
  if (marks >= 40) return 5;
  if (marks >= 35) return 4;
  return 0;
};

export default {
  fetchVTUExternalMarks,
  parseVTUResults,
};
