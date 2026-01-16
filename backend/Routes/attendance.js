const router = require('express').Router();
const pool = require('../config/db');

const authorize = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) return res.status(403).json({ message: "Unauthorized" });
  req.user = { id: userId };
  next();
};

// 1. GET History (No changes needed here, keeping logic consistent)
router.get('/:courseCode', authorize, async (req, res) => {
  try {
    const { courseCode } = req.params;
    const userId = req.user.id;

    // Fetch Course Metadata
    const courseMeta = await pool.query(`
      SELECT MAX(subject) as subject, code, STRING_AGG(DISTINCT room, ', ') as room 
      FROM timetable WHERE user_id = $1 AND code = $2 GROUP BY code
    `, [userId, courseCode]);

    if (courseMeta.rows.length === 0) return res.status(404).json({ message: "Course not found" });

   
    // Fetch History
    const history = await pool.query(`
        SELECT 
          TO_CHAR(ar.date, 'YYYY-MM-DD') as date, -- <--- FIX HERE
          CASE 
            WHEN COUNT(*) FILTER (WHERE ar.status = 'absent') > 0 THEN 'absent' 
            ELSE 'present' 
          END as status
        FROM attendance_records ar
        WHERE ar.user_id = $1 AND ar.course_code = $2
        GROUP BY ar.date
        ORDER BY ar.date DESC
      `, [userId, courseCode]);

    const validDays = await pool.query(
      `SELECT DISTINCT day FROM timetable WHERE user_id = $1 AND code = $2 AND room NOT ILIKE '%Lab%'`, 
      [userId, courseCode]
    );

    res.json({
      details: courseMeta.rows[0],
      history: history.rows,
      scheduleDays: validDays.rows.map(r => r.day) 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. MARK Attendance (UPDATED for new table)
router.post('/mark', authorize, async (req, res) => {
  try {
    const { courseCode, date, status } = req.body;
    const userId = req.user.id;
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

    // 1. Find ID and Subject Name from Timetable
    const scheduleCheck = await pool.query(
      'SELECT id, subject FROM timetable WHERE user_id = $1 AND code = $2 AND day = $3',
      [userId, courseCode, dayName]
    );

    if (scheduleCheck.rows.length === 0) {
      return res.status(400).json({ message: `No class found for ${courseCode} on ${dayName}` });
    }

    // 2. Insert records filling in course_code and subject_name
    for (const slot of scheduleCheck.rows) {
      await pool.query(`
        INSERT INTO attendance_records (user_id, timetable_id, course_code, subject_name, date, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, timetable_id, date)
        DO UPDATE SET status = $6
      `, [userId, slot.id, courseCode, slot.subject, date, status]);
    }

    res.json({ message: "Attendance updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;