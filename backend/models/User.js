// const pool = require('../config/db');

// const createTables = async () => {
//   try {
//     // 1. Users Table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//         full_name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         role VARCHAR(50) DEFAULT 'student',
//         is_verified BOOLEAN DEFAULT FALSE,
//         verification_code VARCHAR(10),
//         avatar_url TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     // 2. Courses Table
//     // await pool.query(`
//     //   CREATE TABLE IF NOT EXISTS courses (
//     //     course_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     //     course_code VARCHAR(20) NOT NULL UNIQUE,
//     //     title VARCHAR(255) NOT NULL,
//     //     credits INTEGER DEFAULT 3,
//     //     instructor_name VARCHAR(255),
//     //     room_number VARCHAR(50),
//     //     department VARCHAR(100),
//     //     total_classes INTEGER DEFAULT 0,
//     //     description TEXT
//     //   );
//     // `);

//     // // 3. Enrollments Table
//     // await pool.query(`
//     //   CREATE TABLE IF NOT EXISTS enrollments (
//     //     enrollment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     //     user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
//     //     course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
//     //     enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     //     UNIQUE(user_id, course_id)
//     //   );
//     // `);

//     // // 4. Attendance Table
//     // await pool.query(`
//     //   CREATE TABLE IF NOT EXISTS attendance (
//     //     attendance_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     //     enrollment_id UUID REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
//     //     date DATE NOT NULL,
//     //     status VARCHAR(20) NOT NULL,
//     //     UNIQUE(enrollment_id, date)
//     //   );
//     // `);

//     // // 5. Timetable Table
//     await pool.query(`
//         CREATE TABLE IF NOT EXISTS timetable (
//             id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//             user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
//             day VARCHAR(20) NOT NULL,       -- e.g., 'Monday'
//             time VARCHAR(20) NOT NULL,      -- e.g., '9 AM'
//             subject VARCHAR(255) NOT NULL,
//             code VARCHAR(50),
//             room VARCHAR(50),
//             color VARCHAR(20) DEFAULT 'blue',
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );
//     `);

//     // // 6. Announcements Table
//     // await pool.query(`
//     //   CREATE TABLE IF NOT EXISTS announcements (
//     //     id SERIAL PRIMARY KEY,
//     //     title VARCHAR(255) NOT NULL,
//     //     content TEXT NOT NULL,
//     //     type VARCHAR(20) DEFAULT 'info',
//     //     poster_name VARCHAR(255),
//     //     date_posted DATE DEFAULT CURRENT_DATE,
//     //     time_posted VARCHAR(10) DEFAULT '12:00 PM'
//     //   );
//     // `);

//     console.log("✅ Tables checked/created successfully");

//   } catch (error) {
//     console.error("❌ Error creating tables:", error.message);
//   }
// };

// module.exports = createTables;