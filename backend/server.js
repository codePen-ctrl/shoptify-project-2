console.log('welcome from POS backend.');

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const hasher = require('bcrypt');
const mailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// ========================
// EXPRESS CONFIG
// ========================
app.use(cors({
    origin: '*'
}));

app.use(express.json({ limit: '50mb' }));

const port = process.env.PORT || 5000;
const secret_key = process.env.SECRET_KEY;

//mail sent congig
const postman = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmail_acc,
        pass: gmail_pass
    }
})


// ========================
// TABLE STRUCTURE
// ========================
const tables = [
    `CREATE TABLE IF NOT EXISTS admin_table (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(150),
        password VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(100),
        avatar LONGTEXT,
        status VARCHAR(255),
        ban BOOLEAN DEFAULT FALSE,
        otp VARCHAR(10),
        expire DATETIME,
        created_at VARCHAR(100),
        updated_at VARCHAR(100)
    )`,

    `CREATE TABLE IF NOT EXISTS user_table (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(150),
        email VARCHAR(255),
        password VARCHAR(255),
        phone VARCHAR(100),
        location VARCHAR(255),
        avatar LONGTEXT,
        ban BOOLEAN DEFAULT FALSE,
        created_at DATETIME,
        updated_at DATETIME
    )`
];

// ========================
// HELPER FUNCTIONS
// ========================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        status: 429,
        success: false,
        reason: 'too_many_requests',
        message: 'Too many requests, please try again later.'
    }
});

const startsWithSpecialChar = (str) => /^[^a-zA-Z0-9]/.test(str);

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const generateToken = (payload = {}) =>
    jwt.sign(payload, secret_key, { expiresIn: '5d' });

const passwordHash = async (password) =>
    await hasher.hash(password, 10);

const generateUserId = () => {
    const letters = [...Array(3)].map(() =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');

    const digits = [...Array(3)].map(() =>
        Math.floor(Math.random() * 10)
    ).join('');

    return `user_${letters}${digits}`;
};
const generateOtpCode = ()=>{
    const code = [...Array(6)].map(()=>{
                return Math.floor(Math.random() * 10);
            }).join('').trim();
    
    return code;
}

const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    const visibleChars = 3;

    if (localPart.length <= visibleChars) {
        return "*".repeat(localPart.length) + "@" + domain;
    }

    const masked = "*".repeat(localPart.length - visibleChars) +
        localPart.slice(-visibleChars);

    return masked + "@" + domain;
};

const checkToken = (token) => {
    try {
        const decode = jwt.verify(token, secret_key);
        return { valid: true, expired: false, payload: decode };
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return { valid: false, expired: true };
        }
        return { valid: false, expired: false };
    }
};

// ========================
// INIT DATABASE
// ========================
const DbUrl = process.env.DATABASE_URL;

const initDB = async () => {

    const db = await mysql.createConnection(DbUrl);

    for (let table of tables) {
        await db.query(table);
    }

    console.log('Database & Table Ready...');

    // ========================
    // SENT OTP
    // ========================

    app.post('/admin/sendOtp', apiLimiter, async (req, res) => {
        try {

            const { email } = req.body;

            if (!email) {
                return res.json({
                    success: false,
                    reason: "email-null"
                });
            }

            if (!isEmail(email)) {
                return res.json({
                    success: false,
                    reason: "not-email"
                });
            }

            const [user] = await db.query(
                `SELECT id, username FROM admin_table WHERE email = ?`,
                [email]
            );

            if (user.length === 0) {
                return res.json({
                    success: false,
                    reason: 'email-not-found',
                    message: "Email not registered."
                });
            }

            const otpCode = generateOtpCode();

            const expireTime = new Date(Date.now() + 5 * 60 * 1000);

            const mailOption = {
                from: gmail_acc,
                to: email,
                subject: "Verify Your Email",
                text: `Your verification code is: ${otpCode}. It will expire in 5 minutes.`,
            }

            const sentMail = async()=>{
                try{
                    const info = await postman.sendMail(mailOption);
                    console.log(info.response);
                }
                catch(err){
                    console.log(err);
                }
            }

            await db.query(
                `UPDATE admin_table 
                SET otp = ?, expire = ? 
                WHERE email = ?`,
                [otpCode, expireTime, email]
            );

            await sentMail();

            return res.json({
                success: true,
                message: "OTP sent successfully."
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    });

    // ========================
    // PASSWORD RECOVERY
    // ========================
    
    app.post('/admin/passwordRecovery', apiLimiter, async (req, res) => {
        try {

            const { email, otp, newPassword } = req.body;

            if (!email)
                return res.json({ success: false, reason: "email-null" });

            if (!otp)
                return res.json({ success: false, reason: "otp-null" });

            if (!newPassword)
                return res.json({ success: false, reason: "password-null" });

            if (newPassword.length < 8)
                return res.json({ success: false, reason: "password-weak" });

            const [user] = await db.query(
                `SELECT otp, expire 
                FROM admin_table 
                WHERE email = ?`,
                [email]
            );

            if (user.length === 0) {
                return res.json({
                    success: false,
                    message: "Email not registered."
                });
            }


            if (!user[0].otp || user[0].otp!== otp) {
                return res.json({
                    success: false,
                    reason: "invalid-otp"
                });
            }

            // Check expiration
            if (new Date(user[0].expire) < new Date()) {
                return res.json({
                    success: false,
                    reason: "otp-expired"
                });
            }

            const hashedPassword = await passwordHash(newPassword);

            await db.query(
                `UPDATE admin_table 
                SET password = ?, 
                otp = NULL, 
                expire = NULL,
                updated_at = NOW()
                WHERE email = ?`,
                [hashedPassword, email]
            );

            return res.json({
                success: true,
                message: "Password updated successfully."
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    });

    // ========================
    // MIDDLEWARE
    // ========================

    const admin_middleware = async (req, res, next) => {
        const {token} = req.query;
        if (!token)
            return res.status(401).json({success: false, expired: true, message: 'No token provided.' });

        const result = checkToken(token);
        if (!result.valid)
            return res.status(401).json({success: false, expired: true, message: 'Invalid or expired token.' });

        if(result.payload.role != "admin"){
            return res.status(401).json({success: false, expired: true, message: 'You are not admin.' });
        }

        const [user] = await db.query(
            `SELECT * FROM admin_table WHERE id = ?`,
            [result.payload.id]
        );

        if (user.length < 1)
            return res.status(404).json({success: false, expired: true, message: 'User not found.' });

        if (user[0].ban === 1)
            return res.status(403).json({success: false, expired: true, message: 'User banned.' });

        req.user = {...user[0], role: result.role};
        next();
    };

    // ========================
    // ROUTES
    // ========================

    app.get('/greeding', apiLimiter, (req, res) => {
        res.send('Hello! Welcome from CMS API.');
    });

    // ========================
    // CHECK TOKEN
    // ========================

    app.post('/admin/checkToken', apiLimiter, async (req, res)=>{
        const {token} = req.body;
        if (!token)
            return res.status(400).json({success: false, expired: true, message: 'Token required.' 
        })
        const result = checkToken(token);
        if (!result.valid)
            return res.status(401).json({success: false, message: 'Invalid or expired token.' });

        console.log(result)
        if(result.payload.role != "admin"){
            return res.status(401).json({success: false, message: 'You are not admin.' });
        }

        const [user] = await db.query(
            `SELECT * FROM admin_table WHERE id = ?`,
            [result.payload.id]
        );

        if (user.length < 1)
            return res.status(404).json({success: false, message: 'User not found.' });

        if (user[0].ban === 1)
            return res.status(403).json({success: false, message: 'User banned.' });

        res.status(200).json({success: true, expired: false, user: {
            id: user[0].id,
            username: user[0].username,
            email: maskEmail(user[0].email),
            phone: user[0].phone,
            avatar: user[0].avatar
        }})
    })

    // ========================
    // SIGNUP
    // ========================

    app.post('/admin/signup', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username)
                return res.status(400).json({success: false, reason: 'username-null', message: 'Username required.' });

            if (startsWithSpecialChar(username))
                return res.status(400).json({success: false, reason: "invalid-username", message: 'Invalid username.' });

            if (!email || !isEmail(email))
                return res.status(400).json({success: false, reason: "not-email", message: 'Invalid email.' });

            if (!password || password.length < 8)
                return res.status(400).json({success: false, reason: "password-weak", message: 'Weak password.' });

            const [exist] = await db.query(
                `SELECT * FROM admin_table WHERE email = ?`,
                [email]
            );

            if (exist.length > 0)
                return res.status(409).json({success: false, reason: "email-used", message: 'Email already used.' });

            const id = generateUserId();
            const hashed = await passwordHash(password);
            const time = new Date().toISOString();

            await db.query(
                `INSERT INTO admin_table 
                (id, username, password, email, phone, avatar, status, ban, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, username, hashed, email, null, null, 'active', false, time, time]
            );

            const token = generateToken({ id, email });

            res.status(200).json({
                success: true,
                user: {
                    id,
                    username,
                    email: maskEmail(email),
                    status: 'active'
                },
                token
            });

        } catch (err) {
            res.status(500).json({success: false, message: err.message });
        }
    });

    // ========================
    // LOGIN
    // ========================

    app.post('/admin/login', apiLimiter, async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email)
                return res.status(400).json({
                    success: false,
                    reason: 'email-null',
                    message: 'Email is required.'
                });

            if (!isEmail(email))
                return res.status(400).json({
                    success: false,
                    reason: 'not-email',
                    message: 'Invalid email format.'
                });

            if (!password)
                return res.status(400).json({
                    success: false,
                    reason: 'password-null',
                    message: 'Password is required.'
                });

            const [user] = await db.query(
                `SELECT * FROM admin_table WHERE email = ?`,
                [email]
            );

            if (user.length < 1)
                return res.status(400).json({
                    success: false,
                    reason: 'email-not-found',
                    message: 'Email not found.'
                });

            const match = await hasher.compare(password, user[0].password);

            if (!match)
                return res.status(401).json({
                    success: false,
                    reason: 'incorrect-password',
                    message: 'Invalid password.'
                });

            const token = generateToken({
                role: 'admin',
                id: user[0].id,
                email: user[0].email
            });

            return res.status(200).json({
                success: true,
                message: 'Login successful.',
                user: {
                    id: user[0].id,
                    username: user[0].username,
                    email: maskEmail(user[0].email),
                    phone: user[0].phone,
                    avatar: user[0].avatar,
                    status: user[0].status
                },
                token,
                expired: false
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    });

    // ========================
    // users stats
    // ========================

    app.get('/admin/stats', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const [totalUsersResult] = await db.query(`SELECT COUNT(*) AS total FROM user_table`);
            const totalUsers = totalUsersResult[0].total;

            const [liveUsersResult] = await db.query(`SELECT COUNT(*) AS live FROM user_table WHERE ban = FALSE`);
            const liveUsers = liveUsersResult[0].live;

            const [expiredUsersResult] = await db.query(`SELECT COUNT(*) AS expired FROM user_table WHERE ban = TRUE`);
            const expiredUsers = expiredUsersResult[0].expired;

            const [dataResult] = await db.query(`SELECT SUM(CHAR_LENGTH(avatar)) AS totalData FROM user_table`);
            const totalData = dataResult[0].totalData || 0;

            let totalDataFormatted = totalData > 0 ? (totalData / (1024 * 1024)).toFixed(2) + ' Mb' : '0 Mb';

            res.status(200).json({
                status: 200,
                success: true,
                data: {
                    totalUsers,
                    liveUsers,
                    expiredUsers,
                    totalData: totalDataFormatted
                }
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                status: 500,
                success: false,
                reason: 'internal_server_error',
                message: err.message
            });
        }
    });

    // ========================
    // CHANGE INFO
    // ========================

    // PUT /admin/changeInfo
    app.post('/admin/changeInfo', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { username, email, phone, avatar, id } = req.body;

            if (username !== null) {
                if (!username.trim())
                    return res.json({ success: false, reason: "username-null" });

                if (startsWithSpecialChar(username))
                    return res.json({ success: false, reason: "username-invalid" });
            }

            if (email !== null) {
                if (!isEmail(email))
                    return res.json({ success: false, reason: "not-email" });

                const [exist] = await db.query(
                    `SELECT id FROM admin_table WHERE email = ?`,
                    [email]
                );

                if (exist.length > 0)
                    return res.json({ success: false, reason: "email-used" });
            }

            if (phone !== null) {
                if (!phone.trim())
                    return res.json({ success: false, reason: "phone-null" });
            }

            const fields = [];
            const values = [];

            if (username !== null) {
                fields.push("username = ?");
                values.push(username);
            }

            if (email !== null) {
                fields.push("email = ?");
                values.push(email);
            }

            if (phone !== null) {
                fields.push("phone = ?");
                values.push(phone);
            }

            if (avatar !== null) {
                fields.push("avatar = ?");
                values.push(avatar);
            }

            if (fields.length === 0) {
                return res.json({
                    success: false,
                    message: "No data to update"
                });
            }

            fields.push("updated_at = ?");
            values.push(new Date().toISOString());

            values.push(id);

            await db.query(
                `UPDATE admin_table SET ${fields.join(", ")} WHERE id = ?`,
                values
            );

            return res.json({
                success: true,
                message: "Profile updated successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // Admin Chart
    // ========================

    app.post('/admin/chart', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const {year, type} = req.body;

            // Initialize result for Jan → Dec
            const result = {
                Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
                Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
            };

            // SQL query base on type
            let sql = '';
            if(type === 'total-users') {
                sql = `SELECT MONTH(created_at) AS month, COUNT(*) AS count
                    FROM user_table
                    WHERE YEAR(created_at) = ?
                    GROUP BY MONTH(created_at)`;
            } else if(type === 'ban-users') {
                sql = `SELECT MONTH(created_at) AS month, COUNT(*) AS count
                    FROM user_table
                    WHERE YEAR(created_at) = ? AND ban = 1
                    GROUP BY MONTH(created_at)`;
            } else if(type === 'live-users') {
                // assume live = not banned
                sql = `SELECT MONTH(created_at) AS month, COUNT(*) AS count
                    FROM user_table
                    WHERE YEAR(created_at) = ? AND ban = 0
                    GROUP BY MONTH(created_at)`;
            } else if(type === 'total-data') {
                // assume total-data = avatar size in KB
                sql = `SELECT MONTH(created_at) AS month, SUM(CHAR_LENGTH(avatar)/1024) AS count
                    FROM user_table
                    WHERE YEAR(created_at) = ?
                    GROUP BY MONTH(created_at)`;
            } else {
                return res.status(400).json({success: false, error: 'Invalid type' });
            }

            const [rows] = await db.query(sql, [parseInt(year) || new Date().getFullYear()]);

            // Fill result
            rows.forEach(row => {
                const monthIndex = row.month; // 1-12
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                result[monthNames[monthIndex - 1]] = row.count || 0;
            });

            res.status(200).json({status: 200, success: true, data: result})

        } catch (err) {
            console.error(err);
            res.status(500).json({success: false, error: 'Server Error' });
        }
    });

    // ========================
    // get all users
    // ========================

    app.get('/admin/allUsers', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT id, username, email, phone, location, avatar, ban, created_at
                FROM user_table
                ORDER BY created_at DESC
            `);

            return res.json({
                success: true,
                total: rows.length,
                data: rows
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // LIVE USERS
    // ========================

    app.get('/admin/liveUsers', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT id, username, email, phone, location, avatar, ban, created_at
                FROM user_table
                WHERE ban = 0
                ORDER BY created_at DESC
            `);

            return res.json({
                success: true,
                total: rows.length,
                data: rows
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // BAN USERS
    // ========================

    app.get('/admin/banUsers',apiLimiter, admin_middleware, async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT id, username, email, phone, location, avatar, ban, created_at
                FROM user_table
                WHERE ban = 1
                ORDER BY created_at DESC
            `);

            return res.json({
                success: true,
                total: rows.length,
                data: rows
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // BAN USER
    // ========================

    app.get('/admin/banUser', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { id } = req.query;

            if (!id)
                return res.status(400).json({success: false, message: 'User id required.'
            });

            const [result] = await db.query(
                `UPDATE user_table 
                SET ban = 1, updated_at = NOW() 
                WHERE id = ?`,
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.json({
                success: true,
                message: "User banned successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // UNBAN USER
    // ========================

    app.get('/admin/unbanUser', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { id } = req.query;

            if (!id)
                return res.status(400).json({success: false, message: 'User id required.'
            });

            const [result] = await db.query(
                `UPDATE user_table 
                SET ban = 0, updated_at = NOW() 
                WHERE id = ?`,
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.json({
                success: true,
                message: "User unbanned successfully"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // DELETE USER
    // ========================

    app.get('/admin/deleteUser', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { id } = req.query;

            if (!id)
                return res.status(400).json({success: false, message: 'User id required.'
            });

            const [result] = await db.query(
                `DELETE FROM user_table WHERE id = ?`,
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.json({
                success: true,
                message: "User deleted successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // CREATE NEW USER
    // ========================

    app.post('/admin/createUser', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { username, password, email, phone, location, avatar } = req.body;

            if (!username)
                return res.json({ success: false, reason: "username-null" 
            });

            if (startsWithSpecialChar(username))
                return res.json({ success: false, reason: "username-invalid" 
            });

            if (!password)
                return res.json({ success: false, reason: "password-null" 
            });

            if (password.length < 8)
                return res.json({ success: false, reason: "password-weak" 
            });

            if (!email)
                return res.json({ success: false, reason: "email-null" 
            });

            if (!isEmail(email))
                return res.json({ success: false, reason: "not-email" 
            });

            if (!phone)
                return res.json({ success: false, reason: "phone-null" 
            });

            if (!location)
                return res.json({ success: false, reason: "location-null" 
            });

            const [emailExist] = await db.query(
                `SELECT id FROM user_table WHERE email = ?`,
                [email]
            );

            if (emailExist.length > 0)
                return res.json({ success: false, reason: "email-used" });

            const hashedPassword = await passwordHash(password);

            await db.query(
                `INSERT INTO user_table 
                (id, username, email, password, phone, location, avatar, ban, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    generateUserId(),
                    username,
                    email,
                    hashedPassword,
                    phone,
                    location,
                    avatar || null,
                    0
                ]
            );

            return res.json({
                success: true,
                message: "User created successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // Create Admin
    // ========================

    app.post('/admin/createAdmin', apiLimiter, admin_middleware, async (req, res) => {
        try {
            const { username, password, email, phone, avatar } = req.body;

            if (!username)
                return res.json({ success: false, reason: "username-null" });

            if (startsWithSpecialChar(username))
                return res.json({ success: false, reason: "username-invalid" });

            if (!password)
                return res.json({ success: false, reason: "password-null" });

            if (password.length < 6)
                return res.json({ success: false, reason: "password-weak" });

            if (!email)
                return res.json({ success: false, reason: "email-null" });

            if (!isEmail(email))
                return res.json({ success: false, reason: "not-email" });

            if (!phone)
                return res.json({ success: false, reason: "phone-null" });

            const [exist] = await db.query(
                `SELECT id FROM admin_table WHERE email = ?`,
                [email]
            );

            if (exist.length > 0)
                return res.json({ success: false, reason: "email-used" });

            const hashedPassword = await passwordHash(password);

            const now = new Date().toISOString();

            await db.query(
                `INSERT INTO admin_table
                (id, username, password, email, phone, avatar, status, ban, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    generateUserId(),
                    username,
                    hashedPassword,
                    email,
                    phone,
                    avatar || null,
                    "active",
                    0,
                    now,
                    now
                ]
            );

            return res.json({
                success: true,
                message: "Admin created successfully"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });

    // ========================
    // SERVER START
    // ========================

    app.listen(port, () => {
        console.log(`Server running at port ${port}...`);
    });

};

initDB().catch(err => console.log(err.message));
