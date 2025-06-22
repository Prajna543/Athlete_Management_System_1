const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const admin = require('firebase-admin');

// ✅ FIXED: Correct require for service account
const serviceAccount = require('./serviceAccountKey.json');

// ✅ Firebase Admin Initialization
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const port = 3000;

// ✅ Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ FIXED FRONTEND PATH 🔥
const frontendPath = path.join(__dirname, '../athlete-frontend');
app.use(express.static(frontendPath));

// ✅ Session Handling
app.use(session({
    secret: 'athleteSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true in production with HTTPS!
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// ✅ Serve HTML Pages
const sendHTML = (file, res) => {
    const filePath = path.join(frontendPath, file);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("❌ Error sending file:", err);
            res.status(500).send("Internal Server Error");
        }
    });
};

// ✅ Routes
app.get('/', (req, res) => sendHTML('login.html', res));
app.get('/signup', (req, res) => sendHTML('signup.html', res));
app.get('/competitions', isLoggedIn, (req, res) => sendHTML('competitions.html', res));
app.get('/injury', isLoggedIn, (req, res) => sendHTML('injury.html', res));
app.get('/finance', isLoggedIn, (req, res) => sendHTML('finance.html', res));
app.get('/profile', isLoggedIn, (req, res) => sendHTML('profile.html', res));
app.get('/dashboard-athlete', isLoggedIn, (req, res) => sendHTML('dashboard-athlete.html', res));
app.get('/dashboard-organizer', isLoggedIn, (req, res) => sendHTML('dashboard-organizer.html', res));

// ✅ Middleware: Check if logged in
function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }
    next();
}

// ✅ Signup API
app.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).json({ success: false, message: "Email already registered." });
        }

        await userRef.set({ name, email, password, role });
        console.log(`✅ New Signup: ${email} (${role})`);

        res.status(200).json({
            success: true,
            message: "Signup successful!",
            redirectUrl: role === "athlete" ? "/dashboard-athlete" : "/dashboard-organizer"
        });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// ✅ Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        const user = userDoc.data();

        if (user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid credentials." });
        }

        req.session.user = user;
        console.log(`✅ Login successful for: ${email}`);

        res.status(200).json({
            success: true,
            message: "Login successful!",
            redirectUrl: user.role === "athlete" ? "/dashboard-athlete" : "/dashboard-organizer"
        });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// ✅ Logout API
app.get('/logout', (req, res) => {
    const userEmail = req.session.user?.email;
    req.session.destroy(err => {
        if (err) {
            console.error("❌ Logout Error:", err);
            return res.status(500).json({ success: false, message: "Logout failed." });
        }
        console.log(`✅ Logout successful for: ${userEmail}`);
        res.json({ success: true, message: "Logout successful." });
    });
});

// ✅ Register Competition
app.post('/register-competition', isLoggedIn, async (req, res) => {
    const { competitionName } = req.body;
    const user = req.session.user;

    if (!competitionName) {
        return res.status(400).json({ success: false, message: "Competition name is required." });
    }

    try {
        await db.collection('competitions').add({
            athleteEmail: user.email,
            competitionName,
            dateRegistered: new Date().toISOString()
        });

        res.json({ success: true, message: "Successfully registered for the competition!" });
    } catch (error) {
        console.error("❌ Competition Registration Error:", error);
        res.status(500).json({ success: false, message: "Failed to register for competition." });
    }
});

// ✅ Report Injury
app.post('/report-injury', isLoggedIn, async (req, res) => {
    const { injuryType, injuryDate, injuryDescription } = req.body;
    const user = req.session.user;

    if (!injuryType || !injuryDate || !injuryDescription) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        await db.collection('injuries').add({
            athleteEmail: user.email,
            injuryType,
            injuryDate,
            injuryDescription
        });

        res.json({ success: true, message: "Injury reported successfully!" });
    } catch (error) {
        console.error("❌ Injury Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to report injury." });
    }
});

// ✅ Save Financial Plan
app.post('/save-financial-plan', isLoggedIn, async (req, res) => {
    const { income, expenses, savingsGoal } = req.body;
    const user = req.session.user;

    if (!income || !expenses || !savingsGoal) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        await db.collection('financialPlans').add({
            athleteEmail: user.email,
            income,
            expenses,
            savingsGoal,
            date: new Date().toISOString()
        });

        res.json({ success: true, message: "Financial plan saved successfully!" });
    } catch (error) {
        console.error("❌ Financial Plan Error:", error);
        res.status(500).json({ success: false, message: "Failed to save financial plan." });
    }
});

// ✅ Start Server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
