const express = require("express")
const db = require("../database/db")
const router = express.Router()

// Get all transactions for admin dashboard
router.get("/transactions", (req, res) => {
  const query = `
        SELECT 
            t.*,
            u.name as user_name,
            u.email as user_email,
            b.title,
            b.author,
            b.isbn
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN books b ON t.book_id = b.id
        ORDER BY t.borrow_date DESC
    `

  db.all(query, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }
    res.json(transactions)
  })
})

// Get dashboard statistics
router.get("/stats", (req, res) => {
  const stats = {}

  // Get total books
  db.get("SELECT COUNT(*) as total FROM books", (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" })
    stats.totalBooks = result.total

    // Get total users
    db.get('SELECT COUNT(*) as total FROM users WHERE role = "student"', (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" })
      stats.totalUsers = result.total

      // Get currently borrowed books
      db.get('SELECT COUNT(*) as total FROM transactions WHERE status = "borrowed"', (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" })
        stats.borrowedBooks = result.total

        // Get overdue books
        const today = new Date().toISOString()
        db.get(
          'SELECT COUNT(*) as total FROM transactions WHERE status = "borrowed" AND due_date < ?',
          [today],
          (err, result) => {
            if (err) return res.status(500).json({ error: "Database error" })
            stats.overdueBooks = result.total

            res.json(stats)
          },
        )
      })
    })
  })
})

module.exports = router
