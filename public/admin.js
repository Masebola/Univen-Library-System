// Admin dashboard functionality

let currentUser = null
let allTransactions = []
let filteredTransactions = []

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  currentUser = checkAuth()

  if (!currentUser || currentUser.role !== "admin") {
    // Redirect to login if not admin
    window.location.href = "auth.html"
    return
  }

  updateAdminInfo()
  loadDashboardData()
})

// Update admin info display
function updateAdminInfo() {
  const adminInfoElement = document.getElementById("adminInfo")
  adminInfoElement.innerHTML = `
        <div class="message success">
            Admin Access: ${currentUser.name} (${currentUser.email})
        </div>
    `
}

// Load all dashboard data
async function loadDashboardData() {
  await Promise.all([loadStatistics(), loadTransactions()])
}

// Load statistics
async function loadStatistics() {
  const container = document.getElementById("statsContainer")

  try {
    const response = await fetch("/api/admin/stats")
    const stats = await response.json()

    container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalBooks || 0}</div>
                    <div class="stat-label">Total Books</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalUsers || 0}</div>
                    <div class="stat-label">Registered Students</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.borrowedBooks || 0}</div>
                    <div class="stat-label">Currently Borrowed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: ${stats.overdueBooks > 0 ? "#dc3545" : "#28a745"}">${stats.overdueBooks || 0}</div>
                    <div class="stat-label">Overdue Books</div>
                </div>
            </div>
        `
  } catch (error) {
    showError(container, "Failed to load statistics. Please try again.")
    console.error("Error loading statistics:", error)
  }
}

// Load transactions
async function loadTransactions() {
  const container = document.getElementById("transactionsContainer")

  try {
    const response = await fetch("/api/admin/transactions")
    allTransactions = await response.json()
    filteredTransactions = [...allTransactions]

    displayTransactions()
  } catch (error) {
    showError(container, "Failed to load transactions. Please try again.")
    console.error("Error loading transactions:", error)
  }
}

// Display transactions table
function displayTransactions() {
  const container = document.getElementById("transactionsContainer")

  if (filteredTransactions.length === 0) {
    container.innerHTML = '<div class="message">No transactions found matching your criteria.</div>'
    return
  }

  const tableHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Book Title</th>
                        <th>Author</th>
                        <th>Borrow Date</th>
                        <th>Due Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                        <th>Days</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTransactions.map((transaction) => createTransactionRow(transaction)).join("")}
                </tbody>
            </table>
        </div>
        <div class="transaction-summary">
            Showing ${filteredTransactions.length} of ${allTransactions.length} transactions
        </div>
    `

  container.innerHTML = tableHTML
}

// Create transaction row
function createTransactionRow(transaction) {
  const borrowDate = new Date(transaction.borrow_date)
  const dueDate = new Date(transaction.due_date)
  const returnDate = transaction.return_date ? new Date(transaction.return_date) : null
  const today = new Date()

  let status, statusClass, daysInfo

  if (returnDate) {
    // Book has been returned
    const daysHeld = Math.ceil((returnDate - borrowDate) / (1000 * 60 * 60 * 24))
    const wasOverdue = returnDate > dueDate

    status = wasOverdue ? "Returned (Late)" : "Returned"
    statusClass = wasOverdue ? "overdue" : "returned"
    daysInfo = `${daysHeld} days held`
  } else {
    // Book is still borrowed
    const isOverdue = today > dueDate
    const daysDiff = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))

    if (isOverdue) {
      status = "Overdue"
      statusClass = "overdue"
      daysInfo = `${daysDiff} days overdue`
    } else {
      status = "Borrowed"
      statusClass = "borrowed"
      const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
      daysInfo = daysRemaining <= 0 ? "Due today" : `${daysRemaining} days left`
    }
  }

  return `
        <tr class="${statusClass}">
            <td>
                <strong>${transaction.user_name}</strong><br>
                <small>${transaction.user_email}</small>
            </td>
            <td><strong>${transaction.title}</strong></td>
            <td>${transaction.author}</td>
            <td>${formatDate(transaction.borrow_date)}</td>
            <td>${formatDate(transaction.due_date)}</td>
            <td>${returnDate ? formatDate(transaction.return_date) : "-"}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${daysInfo}</td>
        </tr>
    `
}

// Filter transactions
function filterTransactions() {
  const filter = document.getElementById("transactionFilter").value
  const today = new Date()

  switch (filter) {
    case "borrowed":
      filteredTransactions = allTransactions.filter((t) => !t.return_date)
      break
    case "returned":
      filteredTransactions = allTransactions.filter((t) => t.return_date)
      break
    case "overdue":
      filteredTransactions = allTransactions.filter((t) => !t.return_date && new Date(t.due_date) < today)
      break
    default:
      filteredTransactions = [...allTransactions]
  }

  // Apply search if there's a search term
  const searchTerm = document.getElementById("searchInput").value
  if (searchTerm) {
    searchTransactions()
  } else {
    displayTransactions()
  }
}

// Search transactions
function searchTransactions() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()

  if (!searchTerm) {
    filterTransactions()
    return
  }

  // Get the currently filtered transactions as base
  const baseTransactions =
    document.getElementById("transactionFilter").value === "all" ? allTransactions : filteredTransactions

  filteredTransactions = baseTransactions.filter(
    (transaction) =>
      transaction.title.toLowerCase().includes(searchTerm) ||
      transaction.author.toLowerCase().includes(searchTerm) ||
      transaction.user_name.toLowerCase().includes(searchTerm) ||
      transaction.user_email.toLowerCase().includes(searchTerm),
  )

  displayTransactions()
}

// Show overdue books
function showOverdueBooks() {
  document.getElementById("transactionFilter").value = "overdue"
  filterTransactions()
  showMessage("Filtered to show overdue books only.", "success")
}

// Export transactions
function exportTransactions() {
  try {
    // Create CSV content
    const headers = [
      "Student Name",
      "Email",
      "Book Title",
      "Author",
      "ISBN",
      "Borrow Date",
      "Due Date",
      "Return Date",
      "Status",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) => {
        const returnDate = transaction.return_date || ""
        const today = new Date()
        const dueDate = new Date(transaction.due_date)
        let status

        if (transaction.return_date) {
          const returnedDate = new Date(transaction.return_date)
          status = returnedDate > dueDate ? "Returned Late" : "Returned On Time"
        } else {
          status = today > dueDate ? "Overdue" : "Borrowed"
        }

        return [
          `"${transaction.user_name}"`,
          `"${transaction.user_email}"`,
          `"${transaction.title}"`,
          `"${transaction.author}"`,
          `"${transaction.isbn || ""}"`,
          `"${formatDate(transaction.borrow_date)}"`,
          `"${formatDate(transaction.due_date)}"`,
          `"${returnDate ? formatDate(returnDate) : ""}"`,
          `"${status}"`,
        ].join(",")
      }),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `library_transactions_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    showMessage("Transactions exported successfully!", "success")
  } catch (error) {
    showMessage("Failed to export transactions.", "error")
    console.error("Export error:", error)
  }
}

// Refresh dashboard
async function refreshDashboard() {
  showMessage("Refreshing dashboard...", "success")
  await loadDashboardData()
  showMessage("Dashboard refreshed successfully!", "success")
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showError(element, message) {
  element.innerHTML = `<div class="error-message">${message}</div>`
}

function showMessage(message, type) {
  const container = document.getElementById("messageContainer")
  container.innerHTML = `<div class="message ${type}">${message}</div>`

  setTimeout(() => {
    container.innerHTML = ""
  }, 5000)
}

function checkAuth() {
  return JSON.parse(localStorage.getItem("user") || "null")
}
