const router = require('express').Router();
const pool = require('../config/db');

// Middleware (Keep your existing authorize middleware here)
const authorize = (req, res, next) => {
  const userId = req.headers['user-id']; 
  if (!userId) return res.status(403).json({ message: "Unauthorized" });
  req.user = { id: userId };
  next();
};

// GET Schedule
router.get('/', authorize, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM timetable WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ADD Class (Updated to handle Duration)
router.post('/', authorize, async (req, res) => {
  try {
    // 1. Get duration from body (default to 1 if missing)
    const { day, time, subject, code, room, color, duration = 1 } = req.body;
    
    const newClass = await pool.query(
      `INSERT INTO timetable (user_id, day, time, subject, code, room, color, duration) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, day, time, subject, code, room, color, duration]
    );

    res.json(newClass.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE Class (This is the logic you requested)
router.delete('/:id', authorize, async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure we only delete if it belongs to the logged-in user
    const deleteOp = await pool.query(
      'DELETE FROM timetable WHERE id = $1 AND user_id = $2 RETURNING *', 
      [id, req.user.id]
    );

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ message: "Class not found or unauthorized" });
    }

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


router.get('/summary', authorize, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const query = `
        SELECT 
          MIN(t.id::text) as id,
          t.code,
          MAX(t.subject) as title,
          MAX(t.color) as color,
          STRING_AGG(DISTINCT t.room, ', ') as location,
          COUNT(t.id) as classes_per_week,
          STRING_AGG(DISTINCT CONCAT(t.day, ' ', t.time), ', ') as time_summary,
          
          -- Subquery: Count total attendance records for this course code
          (SELECT COUNT(*) FROM attendance_records ar 
           WHERE ar.user_id = $1 AND ar.course_code = t.code) as total_conducted,
           
          -- Subquery: Count 'present' records
          (SELECT COUNT(*) FROM attendance_records ar 
           WHERE ar.user_id = $1 AND ar.course_code = t.code AND ar.status = 'present') as total_attended
  
        FROM timetable t
        WHERE t.user_id = $1 AND t.room NOT ILIKE '%Lab%'
        GROUP BY t.code
      `;
  
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

module.exports = router;