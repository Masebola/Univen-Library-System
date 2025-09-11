const express = require("express")
const path = require("path")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const bookRoutes = require("./routes/books")
const adminRoutes = require("./routes/admin")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/admin", adminRoutes)

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`University of Venda Library Management System running on port ${PORT}`)
})
