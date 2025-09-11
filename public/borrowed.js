// Borrowed books management functionality

let currentUser = null

// Declare necessary functions
function checkAuth() {
  // Placeholder for authentication check logic
  return { id: 1, name: "John Doe", email: "john.doe@example.com", role: "user" }
}

function isOverdue(dueDate) {
  const today = new Date()
  return new Date(dueDate) < today
}

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

function showError(container, message) {
  container.innerHTML = `<div class="message error">${message}</div>`
}

// Initialize borrowed books page
document.addEventListener("DOMContentLoaded", () => {
  currentUser = checkAuth()

  if (!currentUser || currentUser.role === "guest") {
    // Redirect to login if not authenticated or guest
    window.location.href = "auth.html"
    return
  }

  updateUserInfo()
  loadBorrowedBooks()
})

// Update user info display
function updateUserInfo() {
  const userInfoElement = document.getElementById("userInfo")
  userInfoElement.innerHTML = `
        <div class="message success">
            Logged in as: ${currentUser.name} (${currentUser.email})
        </div>
    `
}

// Load borrowed books
async function loadBorrowedBooks() {
  const container = document.getElementById("borrowedContainer")

  try {
    const response = await fetch(`/api/books/borrowed/${currentUser.id}`)
    const borrowedBooks = await response.json()

    if (borrowedBooks.length === 0) {
      container.innerHTML = `
                <div class="card">
                    <h2>No Borrowed Books</h2>
                    <p>You haven't borrowed any books yet. Visit the <a href="catalog.html">library catalog</a> to browse and borrow books.</p>
                    <a href="catalog.html" class="btn-primary">Browse Catalog</a>
                </div>
            `
      return
    }

    // Separate current and overdue books
    const currentBooks = []
    const overdueBooks = []

    borrowedBooks.forEach((book) => {
      if (isOverdue(book.due_date)) {
        overdueBooks.push(book)
      } else {
        currentBooks.push(book)
      }
    })

    let html = ""

    // Show overdue books first if any
    if (overdueBooks.length > 0) {
      html += `
                <div class="card">
                    <h2 style="color: #dc3545;">⚠️ Overdue Books (${overdueBooks.length})</h2>
                    <p style="color: #dc3545;">These books are past their due date. Please return them as soon as possible.</p>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>Borrowed Date</th>
                                    <th>Due Date</th>
                                    <th>Days Overdue</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${overdueBooks.map((book) => createBookRow(book, true)).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `
    }

    // Show current books
    if (currentBooks.length > 0) {
      html += `
                <div class="card">
                    <h2>Current Borrowed Books (${currentBooks.length})</h2>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>Borrowed Date</th>
                                    <th>Due Date</th>
                                    <th>Days Remaining</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentBooks.map((book) => createBookRow(book, false)).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `
    }

    container.innerHTML = html
  } catch (error) {
    showError(container, "Failed to load borrowed books. Please try again.")
    console.error("Error loading borrowed books:", error)
  }
}

// Create table row for borrowed book
function createBookRow(book, isOverdueBook) {
  const borrowDate = new Date(book.borrow_date)
  const dueDate = new Date(book.due_date)
  const today = new Date()

  let daysDiff
  let daysText

  if (isOverdueBook) {
    daysDiff = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
    daysText = `${daysDiff} days`
  } else {
    daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    daysText = daysDiff <= 0 ? "Due today" : `${daysDiff} days`
  }

  const rowClass = isOverdueBook ? "overdue" : daysDiff <= 2 ? "warning" : ""

  return `
        <tr class="${rowClass}">
            <td><strong>${book.title}</strong></td>
            <td>${book.author}</td>
            <td>${formatDate(book.borrow_date)}</td>
            <td>${formatDate(book.due_date)}</td>
            <td>${daysText}</td>
            <td>
                <button onclick="returnBook(${book.id})" class="btn-danger">
                    Return Book
                </button>
            </td>
        </tr>
    `
}

// Return a book
async function returnBook(transactionId) {
  if (!confirm("Are you sure you want to return this book?")) {
    return
  }

  try {
    const response = await fetch("/api/books/return", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId: transactionId,
      }),
    })

    const data = await response.json()

    if (data.success) {
      showMessage("Book returned successfully!", "success")
      // Reload borrowed books list
      loadBorrowedBooks()
    } else {
      showMessage(data.error || "Failed to return book", "error")
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error")
    console.error("Error returning book:", error)
  }
}

// Show message to user
function showMessage(message, type) {
  const container = document.getElementById("messageContainer")
  container.innerHTML = `<div class="message ${type}">${message}</div>`

  // Auto-hide after 5 seconds
  setTimeout(() => {
    container.innerHTML = ""
  }, 5000)

  // Scroll to message
  container.scrollIntoView({ behavior: "smooth" })
}
