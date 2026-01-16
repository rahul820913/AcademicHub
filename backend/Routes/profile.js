const router = require('express').Router();
const pool = require('../config/db');

// Middleware to check authentication (Assuming you have this)
const authorize = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) return res.status(403).json({ message: "Unauthorized" });
  req.user = { id: userId };
  next();
};

// 1. GET Full Profile Data
router.get('/', authorize, async (req, res) => {
  try {
    const userId = req.user.id;

    // A. Fetch Basic User Info
    const userRes = await pool.query(
      'SELECT full_name, email, phone, address, dob, blood_group, major, department, enrollment_date FROM users WHERE user_id = $1',
      [userId]
    );

    // B. Fetch Academic History
    const historyRes = await pool.query(
      'SELECT * FROM academic_history WHERE user_id = $1 ORDER BY term DESC',
      [userId]
    );

    // C. Fetch Achievements
    const awardsRes = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1',
      [userId]
    );

    // Calculate CGPA (Simple Average for demo)
    const history = historyRes.rows;
    const completedTerms = history.filter(h => h.gpa !== null);
    const cgpa = completedTerms.length > 0 
      ? (completedTerms.reduce((acc, curr) => acc + parseFloat(curr.gpa), 0) / completedTerms.length).toFixed(2)
      : "0.00";

    res.json({
      user: userRes.rows[0],
      stats: {
        cgpa,
        department: userRes.rows[0]?.department,
        semester: "6th Semester", // You might calculate this from enrollment_date
        enrolled: userRes.rows[0]?.enrollment_date
      },
      history: historyRes.rows,
      achievements: awardsRes.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. UPDATE Personal Information
router.put('/update', authorize, async (req, res) => {
  try {
    const { phone, address, blood_group, major, dob } = req.body;
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET phone = $1, address = $2, blood_group = $3, major = $4, dob = $5 WHERE user_id = $6',
      [phone, address, blood_group, major, dob, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;