// Global JavaScript functionality

// Check authentication status
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user") || "null")
  return user
}

// Logout function
function logout() {
  localStorage.removeItem("user")
  window.location.href = "index.html"
}

// Update navigation based on auth status
function updateNavigation() {
  const user = checkAuth()
  const navMenu = document.querySelector(".nav-menu")

  if (user) {
    // User is logged in
    const userInfo = document.createElement("li")
    userInfo.innerHTML = `
            <span class="user-info">Welcome, ${user.name}</span>
            <button onclick="logout()" class="logout-btn">Logout</button>
        `
    navMenu.appendChild(userInfo)

    // Add library-specific navigation
    if (user.role !== "guest") {
      const borrowedLink = document.createElement("li")
      borrowedLink.innerHTML = '<a href="borrowed.html">My Books</a>'
      navMenu.insertBefore(borrowedLink, userInfo)
    }

    if (user.role === "admin") {
      const adminLink = document.createElement("li")
      adminLink.innerHTML = '<a href="admin.html">Admin</a>'
      navMenu.insertBefore(adminLink, userInfo)
    }

    // Add catalog link
    const catalogLink = document.createElement("li")
    catalogLink.innerHTML = '<a href="catalog.html">Library</a>'
    navMenu.insertBefore(catalogLink, navMenu.children[navMenu.children.length - (user.role === "admin" ? 3 : 2)])
  }
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Check if date is overdue
function isOverdue(dueDateString) {
  const dueDate = new Date(dueDateString)
  const today = new Date()
  return dueDate < today
}

// Show loading state
function showLoading(element) {
  element.innerHTML = '<div class="loading">Loading...</div>'
}

// Show error message
function showError(element, message) {
  element.innerHTML = `<div class="error-message">${message}</div>`
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  updateNavigation()
})
