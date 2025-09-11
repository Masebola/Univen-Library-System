const express = require("express")
const db = require("../database/db")
const router = express.Router()

// Get all books in catalog
router.get("/catalog", (req, res) => {
  db.all("SELECT * FROM books ORDER BY title", (err, books) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }
    res.json(books)
  })
})

// Borrow a book
router.post("/borrow", (req, res) => {
  const { userId, bookId } = req.body

  if (!userId || !bookId) {
    return res.status(400).json({ error: "User ID and Book ID are required" })
  }

  // Check if book is available
  db.get("SELECT * FROM books WHERE id = ? AND available_copies > 0", [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }

    if (!book) {
      return res.status(400).json({ error: "Book not available" })
    }

    // Check if user already borrowed this book
    db.get(
      'SELECT * FROM transactions WHERE user_id = ? AND book_id = ? AND status = "borrowed"',
      [userId, bookId],
      (err, existingTransaction) => {
        if (err) {
          return res.status(500).json({ error: "Database error" })
        }

        if (existingTransaction) {
          return res.status(400).json({ error: "You have already borrowed this book" })
        }

        // Calculate due date (14 days from now)
        const borrowDate = new Date()
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 14)

        // Create transaction
        db.run(
          "INSERT INTO transactions (user_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)",
          [userId, bookId, borrowDate.toISOString(), dueDate.toISOString()],
          function (err) {
            if (err) {
              return res.status(500).json({ error: "Failed to borrow book" })
            }

            // Update book availability
            db.run("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", [bookId])

            res.json({
              success: true,
              transactionId: this.lastID,
              dueDate: dueDate.toISOString(),
            })
          },
        )
      },
    )
  })
})

// Get borrowed books for a user
router.get("/borrowed/:userId", (req, res) => {
  const userId = req.params.userId

  const query = `
        SELECT t.*, b.title, b.author, b.isbn
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        WHERE t.user_id = ? AND t.status = 'borrowed'
        ORDER BY t.borrow_date DESC
    `

  db.all(query, [userId], (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }
    res.json(transactions)
  })
})

// Return a book
router.post("/return", (req, res) => {
  const { transactionId } = req.body

  if (!transactionId) {
    return res.status(400).json({ error: "Transaction ID is required" })
  }

  // Get transaction details
  db.get('SELECT * FROM transactions WHERE id = ? AND status = "borrowed"', [transactionId], (err, transaction) => {
    if (err) {
      return res.status(500).json({ error: "Database error" })
    }

    if (!transaction) {
      return res.status(400).json({ error: "Transaction not found" })
    }

    const returnDate = new Date().toISOString()

    // Update transaction
    db.run(
      'UPDATE transactions SET return_date = ?, status = "returned" WHERE id = ?',
      [returnDate, transactionId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to return book" })
        }

        // Update book availability
        db.run("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [transaction.book_id])

        res.json({ success: true })
      },
    )
  })
})

module.exports = router
