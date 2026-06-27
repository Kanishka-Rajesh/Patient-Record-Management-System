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
      closeBtn.onclick = this.hideAlert;

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

// Expose the hideAlert method globally (if needed)
window.hideAlert = window.alertSystem.hideAlert;
