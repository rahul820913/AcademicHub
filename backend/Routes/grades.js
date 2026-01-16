const router = require('express').Router();
const pool = require('../config/db');

const authorize = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) return res.status(403).json({ message: "Unauthorized" });
  req.user = { id: userId };
  next();
};

// 1. GET Grades for a specific Course
router.get('/:courseCode', authorize, async (req, res) => {
  try {
    const { courseCode } = req.params;
    const result = await pool.query(
      'SELECT assessment_type, score FROM grades WHERE user_id = $1 AND course_code = $2',
      [req.user.id, courseCode]
    );
    
    // Transform array to object: { quiz1: 8, midterm: 25 ... }
    const scores = {};
    result.rows.forEach(row => {
      scores[row.assessment_type] = row.score;
    });
    
    res.json(scores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. SAVE (Upsert) a Score
router.post('/save', authorize, async (req, res) => {
  try {
    const { courseCode, assessmentType, score, maxScore } = req.body;
    
    // If score is empty string, we treat it as NULL (clearing the score)
    const scoreValue = score === '' ? null : score;

    await pool.query(`
      INSERT INTO grades (user_id, course_code, assessment_type, score, max_score)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, course_code, assessment_type)
      DO UPDATE SET score = $4
    `, [req.user.id, courseCode, assessmentType, scoreValue, maxScore]);

    res.json({ message: "Score saved" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;