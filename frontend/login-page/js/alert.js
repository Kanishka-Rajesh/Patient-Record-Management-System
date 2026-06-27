// Alert System Implementation
// This should be included before your main script

// Create the alertSystem global object
window.alertSystem = {
  // Show success message
  success: function (message) {
    this.showAlert(message, "success");
  },

  // Show error message
  error: function (message) {
    this.showAlert(message, "error");
  },

  // Show warning message
  warning: function (message) {
    this.showAlert(message, "warning");
  },

  // Show info message
  info: function (message) {
    this.showAlert(message, "info");
  },

  // Core function to show alert
  showAlert: function (message, type = "success") {
    // Get or create alert bar elements
    let alertBar = document.getElementById("alertBar");

    // If alert bar doesn't exist, create it
    if (!alertBar) {
      alertBar = document.createElement("div");
      alertBar.id = "alertBar";
      alertBar.className = "alert-bar hidden";

      const alertMessage = document.createElement("div");
      alertMessage.id = "alertMessage";
      alertMessage.className = "alert-message";

      const closeBtn = document.createElement("button");
      closeBtn.className = "alert-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = this.hideAlert.bind(this); // Bind to the alertSystem

      alertBar.appendChild(alertMessage);
      alertBar.appendChild(closeBtn);
      document.body.appendChild(alertBar);
    }

    const alertMessage = document.getElementById("alertMessage");

    // Reset all classes
    alertBar.className = "alert-bar";

    // Add the proper alert type class
    alertBar.classList.add(`alert-${type}`);

    // Set the message
    alertMessage.textContent = message;

    // Remove the hidden class
    alertBar.classList.remove("hidden");

    // Auto-hide after 5 seconds
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.hideAlert();
    }, 5000);
  },

  // Hide alert
  hideAlert: function () {
    const alertBar = document.getElementById("alertBar");
    if (alertBar) {
      alertBar.classList.add("hidden");
    }
  },

  // Store timeout ID to prevent multiple timeouts
  timeoutId: null,
};

// Import login function
import { loginUser } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // We'll use the new alert system instead of the error modal

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      window.alertSystem.error("Please enter both email and password.");
      return;
    }

    try {
      const { status, data } = await loginUser(email, password);

      if (status === 200 && data?.data) {
        const role = data.data.role;

        // Show success message with role information
        window.alertSystem.success(`${data.message} - Role: ${role}`);

        // Redirect based on role after a short delay
        setTimeout(() => {
          if (role === "DOCTOR") {
            window.location.href = "../Doctor-dashboard/index.html";
          } else if (role === "RECEPTIONIST") {
            window.location.href = "../Receptionst-dashboard/index.html";
          } else {
            window.alertSystem.warning("Unknown role. Please contact admin.");
          }
        }, 1500); // Delay to show the success message before redirect
      } else {
        // Show specific error message if the credentials are wrong
        window.alertSystem.error(
          data.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      window.alertSystem.error("An error occurred. Please try again later.");
      console.error("Login error:", error);
    }
  });
});
