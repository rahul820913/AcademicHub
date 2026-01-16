const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); 
require('dotenv').config();
// const createTables = require('./models/User');
// createTables();

const Auth = require('./Routes/AuthRoutes');
const TimeTable = require('./Routes/TimeTable');
const Dashboard = require('./Routes/dashboard');
const Attendance = require('./Routes/attendance');
const grade = require('./Routes/grades')
const exam = require('./Routes/exam')
const profile = require('./Routes/profile')







const app = express();


app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', Auth);
app.use('/api/timetable', TimeTable);
app.use('/api/dashboard', Dashboard);
app.use('/api/attendance', Attendance);
// app.use('/api/grades', grade);
app.use('/api/exam', exam);
app.use('/api/profile', profile);

app.get('/', (req, res) => {
  res.send('StudentHub API is running and connected to Neon DB!');
});


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});