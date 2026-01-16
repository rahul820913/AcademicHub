const router = require('express').Router();
const pool = require('../config/db');

const authorize = (req, res, next) => {
  const userId = req.headers['user-id']; 
  if (!userId) return res.status(403).json({ message: "Unauthorized" });
  req.user = { id: userId };
  next();
};

// 1. GET Schedule (No major changes)
router.get('/schedule/today', authorize, async (req, res) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    const result = await pool.query(`
      SELECT t.*, ar.status as marked_status
      FROM timetable t
      LEFT JOIN attendance_records ar 
        ON t.id = ar.timetable_id AND ar.date = CURRENT_DATE
      WHERE t.user_id = $1 AND t.day = $2
      ORDER BY t.time ASC
    `, [req.user.id, todayName]);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. MARK Attendance (UPDATED for new table)
router.post('/mark', authorize, async (req, res) => {
  try {
    const { timetable_id, status, date } = req.body;
    const userId = req.user.id;
    const markDate = date || new Date().toISOString().split('T')[0];
    

    // STEP A: Fetch the Course Code & Subject Name from the timetable first
    const classInfo = await pool.query(
      'SELECT code, subject FROM timetable WHERE id = $1',
      [timetable_id]
    );

    if (classInfo.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const { code, subject } = classInfo.rows[0];

    // STEP B: Insert with all details
    const result = await pool.query(`
      INSERT INTO attendance_records (user_id, timetable_id, course_code, subject_name, date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, timetable_id, date)
      DO UPDATE SET status = $6
      RETURNING *
    `, [userId, timetable_id, code, subject, markDate, status]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


router.get('/stats', authorize, async (req, res) => {
  try {
    
    const result = await pool.query(`
      SELECT 
        t.subject,
        t.code,
        -- Total classes derived from timetable schedule frequency * weeks (approx)
        -- OR simple count of attendance records if we only track "recorded" classes
        COUNT(ar.id) as total_classes,
        SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as attended
      FROM timetable t
      LEFT JOIN attendance_records ar ON t.id = ar.timetable_id
      WHERE t.user_id = $1
      GROUP BY t.subject, t.code
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;