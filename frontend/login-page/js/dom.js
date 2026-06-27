import { loginUser } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorModal = document.getElementById("errorModal");
  const closeBtn = document.getElementById("closeBtn");
  const errorMessage = document.getElementById("errorMessage");

  // Close the error modal when close button is clicked
  closeBtn.addEventListener("click", () => {
    errorModal.style.display = "none";
  });

  // Show error modal with a message
  function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = "flex";
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError("Please enter both email and password.");
      return;
    }

    const { status, data } = await loginUser(email, password);

    if (status === 200 && data?.data) {
      const role = data.data.role;

      // Show success message with role information
      showError(`${data.message} - Role: ${role}`);

      // Redirect based on role
      if (role === "DOCTOR") {
        window.location.href = "../Doctor-dashboard/index.html";
      } else if (role === "RECEPTIONIST") {
        window.location.href = "../Receptionst-dashboard/index.html";
      } else {
        showError("Unknown role. Please contact admin.");
      }
    } else {
      // Show specific error message if the credentials are wrong
      showError(data.message || "Login failed. Please try again.");
    }
  });
});
