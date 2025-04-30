const express = require("express");
const router = express.Router();
const Assignment = require("../../models/Assignment");
const Student = require("../../models/student");
const Response = require("../../models/Response"); // Assuming Response model exists
const authenticateStudent = require("../../middleware/fetchuser");
const moment = require('moment-timezone');

// ===== Helper function for result calculation =====
function calculateMarks(testResults) {
    if (!testResults || !testResults.allResults) return null;

    const submissions = testResults.allResults;
    const totalTests = submissions.length;
    const passedTests = submissions.filter(sub => sub.isSuccess);

    // Scenario 1 - Equal weightage
    const scenario1 = (() => {
        const totalPossibleMarks = totalTests * 2;
        const obtainedMarks = passedTests.length * 2;
        return ((obtainedMarks / totalPossibleMarks) * 10).toFixed(2);
    })();

    // Scenario 2 - Weighted based on difficulty
    const scenario2 = (() => {
        const easyCount = Math.floor(totalTests * 0.3);
        const mediumCount = Math.floor(totalTests * 0.4);
        const hardCount = totalTests - easyCount - mediumCount;

        const marksArray = [];
        for (let i = 0; i < totalTests; i++) {
            if (i < easyCount) marksArray.push(1);
            else if (i < easyCount + mediumCount) marksArray.push(1.5);
            else marksArray.push(2.5);
        }

        let obtainedMarks = 0;
        let totalPossibleMarks = 0;
        for (let i = 0; i < totalTests; i++) {
            totalPossibleMarks += marksArray[i];
            if (submissions[i].isSuccess) {
                obtainedMarks += marksArray[i];
            }
        }

        return ((obtainedMarks / totalPossibleMarks) * 10).toFixed(2);
    })();

    // Scenario 3 - Progressive difficulty
    const scenario3 = (() => {
        let obtainedMarks = 0;
        let totalPossibleMarks = 0;
        
        submissions.forEach((sub, index) => {
            // Progressive weight: later tests are worth more
            const weight = 1 + (index * 0.5);
            totalPossibleMarks += weight;
            if (sub.isSuccess) {
                obtainedMarks += weight;
            }
        });

        return ((obtainedMarks / totalPossibleMarks) * 10).toFixed(2);
    })();

    return {
        scenario1: scenario1,
        scenario2: scenario2,
        scenario3: scenario3
    };
}

router.post("/:assignmentId/submit", authenticateStudent, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id; // Get studentId from authenticated user
        const { responseText, timeTaken, testResults } = req.body;

        // Calculate marks using the helper function
        const calculatedMarks = calculateMarks(testResults);

        // Find the assignment to get a random question
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        
        // Create new response with calculated marks
        const response = new Response({
            student_id: studentId,
            assignment_id: assignmentId,
            question_id: assignment.questions[Math.floor(Math.random() * assignment.questions.length)],
            response_text: responseText,
            time_taken: timeTaken,
            test_results: testResults,
            marks: {
                scenario1Marks: calculatedMarks?.scenario1 || 0,
                scenario2Marks: calculatedMarks?.scenario2 || 0,
                scenario3Marks: calculatedMarks?.scenario3 || 0
            },
            marks_obtained: (() => {
                const s1 = parseFloat(calculatedMarks?.scenario1 || 0);
                const s2 = parseFloat(calculatedMarks?.scenario2 || 0);
                const s3 = parseFloat(calculatedMarks?.scenario3 || 0);
                
                // Ensure all values are valid numbers
                const validMarks = [s1, s2, s3].filter(mark => !isNaN(mark));
                
                // If no valid marks, return 0, otherwise return the maximum
                return validMarks.length > 0 ? Math.max(...validMarks) : 0;
            })()
        });

        await response.save();

        res.status(201).json({
            message: "Response submitted successfully",
            response,
            marks: response.marks
        });

    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to mark assignment as submitted
router.post("/mark-submitted/:assignmentId", authenticateStudent, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id;

        // Find if there's already a submission
        const existingSubmission = await Response.findOne({ 
            assignment_id: assignmentId, 
            student_id: studentId 
        });

        if (!existingSubmission) {
            return res.status(404).json({ message: "No submission found" });
        }

        existingSubmission.isSubmitted = true;
        await existingSubmission.save();

        res.status(200).json({ message: "Assignment marked as submitted" });
    } catch (error) {
        console.error("Error marking assignment as submitted:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Result Calculation Route (integrated as router.post)
router.post("/resultCalculation/:assignmentId", async (req, res) => {
    try {
        const { judge0RawResponse } = req.body;

        // judge0RawResponse should have a "submissions" array
        const submissions = judge0RawResponse && judge0RawResponse.submissions;

        if (!submissions) {
            return res.status(400).json({ error: 'Missing submissions' });
        }

        const totalTests = submissions.length;
        const passedTests = submissions.filter(sub => sub.status.id === 3);

        // ====== SCENARIO 1: Simple 2 marks per pass ======
        const scenario1 = (() => {
            const totalPossibleMarks = totalTests * 2;
            const obtainedMarks = passedTests.length * 2;
            return ((obtainedMarks / totalPossibleMarks) * 10).toFixed(2);
        })();

        // ====== SCENARIO 2: Weighted based on difficulty ======
        const scenario2 = (() => {
            const easyCount = Math.floor(totalTests * 0.3);
            const mediumCount = Math.floor(totalTests * 0.4);
            const hardCount = totalTests - easyCount - mediumCount;

            const marksArray = [];
            for (let i = 0; i < totalTests; i++) {
                if (i < easyCount) marksArray.push(1);
                else if (i < easyCount + mediumCount) marksArray.push(1.5);
                else marksArray.push(2.5);
            }

            let obtainedMarks = 0;
            let totalPossibleMarks = 0;
            for (let i = 0; i < totalTests; i++) {
                totalPossibleMarks += marksArray[i];
                if (submissions[i].status.id === 3) {
                    obtainedMarks += marksArray[i];
                }
            }

            return ((obtainedMarks / totalPossibleMarks) * 10).toFixed(2);
        })();

        // ====== SCENARIO 3: Weighted + Time/Memory penalties ======
        const scenario3 = (() => {
            const easyCount = Math.floor(totalTests * 0.3);
            const mediumCount = Math.floor(totalTests * 0.4);
            const hardCount = totalTests - easyCount - mediumCount;

            const marksArray = [];
            for (let i = 0; i < totalTests; i++) {
                if (i < easyCount) marksArray.push(1);
                else if (i < easyCount + mediumCount) marksArray.push(1.5);
                else marksArray.push(2.5);
            }

            const timeThreshold = 0.08; // seconds
            const memoryThreshold = 20480; // KB

            let obtainedMarks = 0;
            let totalPossibleMarks = 0;
            for (let i = 0; i < totalTests; i++) {
                totalPossibleMarks += marksArray[i];

                if (submissions[i].status.id === 3) {
                    let marks = marksArray[i];

                    if (submissions[i].time > timeThreshold) {
                        marks -= 0.2;
                    }
                    if (submissions[i].memory > memoryThreshold) {
                        marks -= 0.2;
                    }

                    if (marks < 0) marks = 0;
                    obtainedMarks += marks;
                }
            }

            return ((obtainedMarks / totalPossibleMarks) * 10).toFixed(2);
        })();

        // ====== FINAL RESPONSE ======
        return res.json({
            scenario1Marks: scenario1,
            scenario2Marks: scenario2,
            scenario3Marks: scenario3
        });

    } catch (err) {
        console.error("Error in resultCalculation:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;