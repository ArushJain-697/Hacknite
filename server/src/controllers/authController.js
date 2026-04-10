// ... (Upar ka imports aur cookieOptions same rakhna)

// 1. Token mein role pack karo
function signToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );
}

// 2. Register mein role save karo
exports.register = async (req, res) => {
    try {
        // NAYA: req.body se role bhi extract karo
        const { username, password, role } = req.body; 
        const [existingRows] = await pool.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
        if (existingRows.length > 0) return res.status(409).json({ message: "Username already in use" });

        const passwordHash = await bcrypt.hash(password, 12);
        const derivedEmail = `${username}@sicari.local`;
        
        // NAYA: Agar user ne role nahi diya, toh default 'sicario' bana do
        const assignedRole = role || "sicario"; 

        const [insertResult] = await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, derivedEmail, passwordHash, assignedRole] // Role DB mein chala gaya
        );

        const user = { id: insertResult.insertId, username, role: assignedRole };
        const token = signToken(user);

        res.cookie("jwt", token, cookieOptions);
        return res.status(201).json({ message: "User created", user });
    } catch (error) { return internalError(res, "Internal server error", error); }
};

// 3. Login mein role fetch karo
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // NAYA: Select query mein 'role' add kiya
        const [rows] = await pool.query("SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1", [username]);

        const user = rows[0];
        if (!user) return res.status(401).json({ message: "Invalid username or password" });

        const storedPassword = user.password || "";
        const isBcryptHash = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$");

        let isMatch = false;
        if (isBcryptHash) {
            isMatch = await bcrypt.compare(password, storedPassword);
        } else {
            isMatch = storedPassword === password;
            if (isMatch) {
                const upgradedHash = await bcrypt.hash(password, 12);
                await pool.query("UPDATE users SET password = ? WHERE id = ?", [upgradedHash, user.id]);
            }
        }

        if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

        const token = signToken(user);
        res.cookie("jwt", token, cookieOptions);

        return res.json({ message: "Login successful", user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) { return internalError(res, "Internal server error", error); }
};

// 4. /me mein role wapas bhejo React ke liye
exports.getMe = async (req, res) => {
    try {
        // NAYA: Select query mein 'role' add kiya
        const [rows] = await pool.query("SELECT id, username, role, created_at FROM users WHERE id = ? LIMIT 1", [req.user.sub]);
        const user = rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ user });
    } catch (error) { return internalError(res, "Internal server error", error); }
};

// ... (Baaki checkUser, logout, getUsers functions waise hi rahenge)