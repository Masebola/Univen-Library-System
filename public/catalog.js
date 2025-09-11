// Book catalog functionality

let currentUser = null

// Declare necessary functions
function checkAuth() {
  // Placeholder for authentication check logic
  return JSON.parse(localStorage.getItem("user")) || null
}

function updateNavigation() {
  // Placeholder for navigation update logic
  console.log("Navigation updated for guest user.")
}

function showError(container, message) {
  container.innerHTML = `<div class="message error">${message}</div>`
}

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

// Initialize catalog page
document.addEventListener("DOMContentLoaded", () => {
  currentUser = checkAuth()
  updateUserStatus()
  loadCatalog()
})

// Update user status display
function updateUserStatus() {
  const statusElement = document.getElementById("userStatus")

  if (!currentUser) {
    statusElement.innerHTML = `
            <div class="message error">
                You are not logged in. <a href="auth.html">Login</a> to borrow books or <a href="#" onclick="continueAsGuest()">continue as guest</a> to browse only.
            </div>
        `
    return
  }

  if (currentUser.role === "guest") {
    statusElement.innerHTML = `
            <div class="message" style="background-color: #fff3cd; color: #856404; border-color: #ffeaa7;">
                You are browsing as a guest. <a href="auth.html">Create an account</a> to borrow books.
            </div>
        `
  } else {
    statusElement.innerHTML = `
            <div class="message success">
                Welcome, ${currentUser.name}! You can borrow available books.
            </div>
        `
  }
}

// Continue as guest
function continueAsGuest() {
  fetch("/api/auth/guest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        currentUser = data.user
        updateUserStatus()
        updateNavigation()
      }
    })
    .catch((error) => {
      console.error("Error:", error)
    })
}

// Load book catalog
async function loadCatalog() {
  const container = document.getElementById("catalogContainer")

  try {
    const response = await fetch("/api/books/catalog")
    const books = await response.json()

    if (books.length === 0) {
      container.innerHTML = '<div class="message">No books available in the catalog.</div>'
      return
    }

    // Group books by category
    const booksByCategory = books.reduce((acc, book) => {
      const category = book.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(book)
      return acc
    }, {})

    // Generate HTML
    let html = ""

    Object.keys(booksByCategory)
      .sort()
      .forEach((category) => {
        html += `
                <div class="card">
                    <h2>${category}</h2>
                    <div class="book-grid">
                        ${booksByCategory[category].map((book) => createBookCard(book)).join("")}
                    </div>
                </div>
            `
      })

    container.innerHTML = html
  } catch (error) {
    showError(container, "Failed to load catalog. Please try again.")
    console.error("Error loading catalog:", error)
  }
}

// Create book card HTML
function createBookCard(book) {
  const isAvailable = book.available_copies > 0
  const canBorrow = currentUser && currentUser.role !== "guest" && isAvailable

  return `
        <div class="book-card">
            <div class="book-title">${book.title}</div>
            <div class="book-author">by ${book.author}</div>
            ${book.isbn ? `<div class="book-isbn">ISBN: ${book.isbn}</div>` : ""}
            <div class="book-category">${book.category || "General"}</div>
            <div class="book-status ${isAvailable ? "available" : "unavailable"}">
                ${isAvailable ? `Available (${book.available_copies}/${book.total_copies})` : "Currently Borrowed"}
            </div>
            ${
              canBorrow
                ? `<button onclick="borrowBook(${book.id})" class="btn-primary">Borrow Book</button>`
                : `<button class="btn-secondary" disabled>
                    ${
                      !currentUser
                        ? "Login to Borrow"
                        : currentUser.role === "guest"
                          ? "Account Required"
                          : "Not Available"
                    }
                </button>`
            }
        </div>
    `
}

// Borrow a book
async function borrowBook(bookId) {
  if (!currentUser || currentUser.role === "guest") {
    showMessage("Please login with a student account to borrow books.", "error")
    return
  }

  try {
    const response = await fetch("/api/books/borrow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        bookId: bookId,
      }),
    })

    const data = await response.json()

    if (data.success) {
      showMessage("Book borrowed successfully! Due date: " + formatDate(data.dueDate), "success")
      // Reload catalog to update availability
      loadCatalog()
    } else {
      showMessage(data.error || "Failed to borrow book", "error")
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error")
    console.error("Error borrowing book:", error)
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
