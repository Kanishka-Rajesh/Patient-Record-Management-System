// Alert types
const ALERT_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// Create the alert utility as a global object
window.alertSystem = {
  // Alert elements
  alertBar: null,
  alertMessage: null,
  alertClose: null,
  autoHideTimer: null,

  // Initialize the alert system
  init() {
    // Check if the alert bar already exists
    this.alertBar = document.getElementById("alertBar");

    // If it doesn't exist, create it
    if (!this.alertBar) {
      this.createAlertBar();
    } else {
      this.alertMessage = document.getElementById("alertMessage");
      this.alertClose = document.getElementById("alertClose");
    }

    // Add event listener to close button
    if (this.alertClose) {
      this.alertClose.addEventListener("click", () => this.hideAlert());
    }
  },

  // Create the alert bar dynamically to ensure it's always at the top of the DOM
  createAlertBar() {
    const alertBar = document.createElement("div");
    alertBar.id = "alertBar";
    alertBar.className = "alert-bar hidden";

    const alertMessage = document.createElement("div");
    alertMessage.id = "alertMessage";
    alertMessage.className = "alert-message";

    const alertClose = document.createElement("button");
    alertClose.id = "alertClose";
    alertClose.className = "alert-close";
    alertClose.innerHTML = "×";
    alertClose.addEventListener("click", () => this.hideAlert());

    alertBar.appendChild(alertMessage);
    alertBar.appendChild(alertClose);

    // Add to the end of body to ensure it's above everything
    document.body.appendChild(alertBar);

    this.alertBar = alertBar;
    this.alertMessage = alertMessage;
    this.alertClose = alertClose;
  },

  // Show an alert with specified message and type
  showAlert(message, type = ALERT_TYPES.INFO, duration = 5000) {
    // Clear any existing timer
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }

    // Set message
    this.alertMessage.textContent = message;

    // Remove all type classes
    this.alertBar.classList.remove(
      "alert-success",
      "alert-error",
      "alert-info",
      "alert-warning"
    );

    // Add the appropriate type class
    this.alertBar.classList.add(`alert-${type}`);

    // Show the alert
    this.alertBar.classList.remove("hidden");

    // Force the alert to be on top
    document.body.appendChild(this.alertBar);

    // Auto-hide after specified duration if duration > 0
    if (duration > 0) {
      this.autoHideTimer = setTimeout(() => {
        this.hideAlert();
      }, duration);
    }
  },

  // Hide the alert
  hideAlert() {
    this.alertBar.classList.add("hidden");
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }
  },

  // Convenience methods for different alert types
  success(message, duration = 3000) {
    this.showAlert(message, ALERT_TYPES.SUCCESS, duration);
  },

  error(message, duration = 5000) {
    this.showAlert(message, ALERT_TYPES.ERROR, duration);
  },

  info(message, duration = 4000) {
    this.showAlert(message, ALERT_TYPES.INFO, duration);
  },

  warning(message, duration = 4000) {
    this.showAlert(message, ALERT_TYPES.WARNING, duration);
  },
};

// Initialize the alert system when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.alertSystem.init();
});
