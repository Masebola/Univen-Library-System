const express = require("express")
const bcrypt = require("bcryptjs")
const db = require("../database/db")
const router = express.Router()

// Register new student
router.post("/register", (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }

  // Check if user already exists
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }

    if (user) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password and create user
    const hashedPassword = bcrypt.hashSync(password, 10)

    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to create user" })
      }

      res.json({
        success: true,
        user: {
          id: this.lastID,
          name,
          email,
          role: "student",
        },
      })
    })
  })
})

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  })
})

// Guest login
router.post("/guest", (req, res) => {
  res.json({
    success: true,
    user: {
      id: null,
      name: "Guest User",
      email: null,
      role: "guest",
    },
  })
})

module.exports = router
