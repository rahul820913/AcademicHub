const router = require('express').Router();
const pool = require('../config/db');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: Generate a random 5-digit number
const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

// --------------------------------------------------------------------------
// 1. REGISTER ROUTE
// --------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Check if user exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(401).json({ message: "User already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 3. Generate OTP
    const otp = generateOTP();

    // 4. Insert User (Default is_verified = FALSE)
    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password, role, is_verified, verification_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [fullName, email, bcryptPassword, 'student', false, otp]
    );

    // 5. SEND EMAIL (SIMULATED)
    // In a real app, use Nodemailer/SendGrid here.
    // For now, we log it to the console so you can copy-paste it.
    console.log("==================================================");
    console.log(`EMAIL SENT TO ${email}`);
    console.log(`YOUR VERIFICATION CODE IS: ${otp}`);
    console.log("==================================================");

    // 6. Return success (Don't send token yet, wait for verify)
    res.json({ 
      message: "Registration successful. Please check your email for OTP.",
      email: newUser.rows[0].email // Send email back so frontend knows who to verify
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --------------------------------------------------------------------------
// 2. VERIFY OTP ROUTE
// --------------------------------------------------------------------------
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Find user by email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Check if already verified
    if (user.rows[0].is_verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // 3. Check OTP
    if (user.rows[0].verification_code !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // 4. Verify User in DB & Clear OTP
    await pool.query(
      'UPDATE users SET is_verified = $1, verification_code = $2 WHERE user_id = $3',
      [true, null, user.rows[0].user_id]
    );

    // 5. Generate Token (Auto-login after verify)
    const token = jwt.sign(
      { id: user.rows[0].user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ 
      message: "Email verified successfully!",
      token,
      user: {
        id: user.rows[0].user_id,
        fullName: user.rows[0].full_name,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --------------------------------------------------------------------------
// 3. LOGIN ROUTE
// --------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check User
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 2. Check Password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 3. Check Verification Status
    if (!user.rows[0].is_verified) {
      return res.status(403).json({ 
        message: "Please verify your email first", 
        needsVerification: true,
        email: email 
      });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user.rows[0].user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      user: {
        id: user.rows[0].user_id,
        fullName: user.rows[0].full_name,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;