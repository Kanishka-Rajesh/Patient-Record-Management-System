// alert.js
// This file handles the alert notification system

class AlertSystem {
  constructor() {
    this.alertBar = document.getElementById("alertBar");
    this.alertMessage = document.getElementById("alertMessage");
    this.alertClose = document.getElementById("alertClose");
    this.timeout = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // If alert close button exists, add event listener
    if (this.alertClose) {
      this.alertClose.addEventListener("click", () => this.hide());
    }
  }

  // Show alert with message and type
  show(message, type = "info", duration = 5000) {
    if (!this.alertBar || !this.alertMessage) return;

    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Remove all type classes
    this.alertBar.classList.remove(
      "notification-success",
      "notification-error",
      "notification-warning",
      "notification-info"
    );

    // Add the appropriate type class
    this.alertBar.classList.add(`notification-${type}`);

    // Set the message
    this.alertMessage.textContent = message;

    // Show the alert
    this.alertBar.classList.remove("hidden");

    // Set timeout to auto-hide
    this.timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  // Hide alert
  hide() {
    if (!this.alertBar) return;
    this.alertBar.classList.add("hidden");

    // Clear timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  // Helper methods for different alert types
  success(message, duration) {
    this.show(message, "success", duration);
  }

  error(message, duration) {
    this.show(message, "error", duration);
  }

  warning(message, duration) {
    this.show(message, "warning", duration);
  }

  info(message, duration) {
    this.show(message, "info", duration);
  }
}

// Create the alert system and add it to the window
window.alertSystem = new AlertSystem();

export default window.alertSystem;
