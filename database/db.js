const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const bcrypt = require("bcryptjs")

const dbPath = path.join(__dirname, "library.db")
const db = new sqlite3.Database(dbPath)

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)

  // Books table
  db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT,
        category TEXT,
        availability_status TEXT DEFAULT 'available',
        total_copies INTEGER DEFAULT 1,
        available_copies INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME NOT NULL,
        return_date DATETIME NULL,
        status TEXT DEFAULT 'borrowed',
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (book_id) REFERENCES books (id)
    )`)

  // Insert default admin user
  const adminPassword = bcrypt.hashSync("admin123", 10)
  db.run(
    `INSERT OR IGNORE INTO users (name, email, password, role) 
            VALUES ('Admin User', 'admin@univen.ac.za', ?, 'admin')`,
    [adminPassword],
  )

  // Insert sample books
  const sampleBooks = [
    ["Introduction to Computer Science", "John Smith", "978-0123456789", "Computer Science"],
    ["Database Management Systems", "Sarah Johnson", "978-0987654321", "Computer Science"],
    ["Web Development Fundamentals", "Mike Brown", "978-0456789123", "Web Development"],
    ["Data Structures and Algorithms", "Emily Davis", "978-0321654987", "Computer Science"],
    ["Software Engineering Principles", "David Wilson", "978-0789123456", "Software Engineering"],
    ["Network Security", "Lisa Anderson", "978-0654321098", "Cybersecurity"],
    ["Mobile App Development", "Chris Taylor", "978-0147258369", "Mobile Development"],
    ["Artificial Intelligence", "Jennifer Lee", "978-0963852741", "AI/ML"],
    ["Digital Marketing", "Robert Garcia", "978-0852741963", "Marketing"],
    ["Project Management", "Amanda White", "978-0741852963", "Management"],
  ]

  const insertBook = db.prepare(`INSERT OR IGNORE INTO books (title, author, isbn, category) VALUES (?, ?, ?, ?)`)
  sampleBooks.forEach((book) => {
    insertBook.run(book)
  })
  insertBook.finalize()
})

module.exports = db
