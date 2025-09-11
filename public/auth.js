// Authentication JavaScript functionality

// Show/hide forms
function showLogin() {
  document.getElementById("loginForm").classList.add("active")
  document.getElementById("signupForm").classList.remove("active")
  document.getElementById("guestAccess").classList.remove("active")

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelectorAll(".tab-btn")[0].classList.add("active")
}

function showSignup() {
  document.getElementById("loginForm").classList.remove("active")
  document.getElementById("signupForm").classList.add("active")
  document.getElementById("guestAccess").classList.remove("active")

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelectorAll(".tab-btn")[1].classList.add("active")
}

function guestLogin() {
  document.getElementById("loginForm").classList.remove("active")
  document.getElementById("signupForm").classList.remove("active")
  document.getElementById("guestAccess").classList.add("active")

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelectorAll(".tab-btn")[2].classList.add("active")
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success) {
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      showMessage("Login successful! Redirecting...", "success")

      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "admin.html"
        } else {
          window.location.href = "catalog.html"
        }
      }, 1500)
    } else {
      showMessage(data.error || "Login failed", "error")
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error")
  }
}

// Handle signup form submission
async function handleSignup(event) {
  event.preventDefault()

  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value

  // Basic validation
  if (password.length < 6) {
    showMessage("Password must be at least 6 characters long", "error")
    return
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (data.success) {
      // Store user data and redirect
      localStorage.setItem("user", JSON.stringify(data.user))
      showMessage("Account created successfully! Redirecting...", "success")

      setTimeout(() => {
        window.location.href = "catalog.html"
      }, 1500)
    } else {
      showMessage(data.error || "Registration failed", "error")
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error")
  }
}

// Handle guest login
async function handleGuestLogin() {
  try {
    const response = await fetch("/api/auth/guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user))
      showMessage("Continuing as guest...", "success")

      setTimeout(() => {
        window.location.href = "catalog.html"
      }, 1000)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error")
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
}

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user") || "null")
  if (user) {
    // User is already logged in, redirect appropriately
    if (user.role === "admin") {
      window.location.href = "admin.html"
    } else {
      window.location.href = "catalog.html"
    }
  }
})
