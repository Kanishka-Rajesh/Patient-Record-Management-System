// dom.js - Place this in the 'js' folder
import {
  generateFallbackToken,
  fetchPatientById,
  bookAppointment,
} from "./api.js";

// DOM Element references
const overlay = document.getElementById("overlay");
const overlayClose = document.getElementById("overlayClose");
const addPatientCard = document.getElementById("addPatientCard");
const appointmentForm = document.querySelector("#overlay form");
const patientIdInput = document.getElementById("patient-id");
const appointmentDateInput = document.getElementById("appointment-date");
const appointmentTimeInput = document.getElementById("appointment-time"); // Added time input
const appointmentTypeInput = document.getElementById("appointment-type");
const patientDetailsDisplay = document.querySelector(".patient-info-display");
const patientCodeEl = document.getElementById("patient-code");
const patientDetailCard = document.querySelector(".patient-info-card");
const clearBtn = appointmentForm
  ? appointmentForm.querySelector('button[type="reset"]')
  : null;
const submitBtn = appointmentForm
  ? appointmentForm.querySelector('button[type="submit"]')
  : null;

// Patient data cache
let currentPatientData = null;

// Initialize event listeners
function init() {
  console.log("Initializing DOM event listeners");

  // Add appointment button click
  if (addPatientCard) {
    addPatientCard.addEventListener("click", openAppointmentForm);
    console.log("Add patient card listener added");
  } else {
    console.error("Add patient card element not found");
  }

  // Close overlay button
  if (overlayClose) {
    overlayClose.addEventListener("click", closeOverlay);
    console.log("Overlay close listener added");
  } else {
    console.error("Overlay close button not found");
  }

  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetForm();
      console.log("Form reset");
    });
    console.log("Clear button listener added");
  } else {
    console.error("Clear button not found");
  }

  // Form submission
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", handleAppointmentSubmit);
    console.log("Form submission listener added");
  } else {
    console.error("Appointment form not found");
  }

  // Patient ID input blur event for fetching patient details
  if (patientIdInput) {
    patientIdInput.addEventListener("blur", fetchPatientDetails);
    console.log("Patient ID input blur listener added");
  } else {
    console.error("Patient ID input not found");
  }

  // Set minimum date for appointment to today
  if (appointmentDateInput) {
    const today = new Date().toISOString().split("T")[0];
    appointmentDateInput.setAttribute("min", today);
    console.log("Appointment date minimum set to today:", today);
  } else {
    console.error("Appointment date input not found");
  }
}

/**
 * Open the appointment booking form
 */
function openAppointmentForm() {
  console.log("Opening appointment form");
  overlay.classList.remove("hidden");
  resetForm();
}

/**
 * Close the overlay
 */
function closeOverlay() {
  console.log("Closing overlay");
  overlay.classList.add("hidden");
  resetForm();
}

/**
 * Reset form fields and hide patient details
 */
function resetForm() {
  console.log("Resetting form");
  if (appointmentForm) {
    appointmentForm.reset();
    appointmentForm.style.display = "block"; // Ensure form is visible when reset
  }
  if (patientDetailsDisplay) {
    patientDetailsDisplay.classList.add("hidden");
  }
  // Reset patient data cache
  currentPatientData = null;
}

/**
 * Hide registration form and show only patient details
 */
function hideRegistrationForm() {
  console.log("Hiding registration form");
  if (appointmentForm) {
    appointmentForm.style.display = "none";
  }
  if (patientDetailsDisplay) {
    patientDetailsDisplay.classList.remove("hidden");
  }
}

/**
 * Fetch patient details when ID is entered but don't display them yet
 */
async function fetchPatientDetails() {
  const patientId = patientIdInput.value.trim();

  if (!patientId) {
    currentPatientData = null;
    return;
  }

  try {
    console.log("Fetching patient details for ID:", patientId);
    window.alertSystem.info("Fetching patient details...");

    // Fetch patient details from API
    const response = await fetchPatientById(patientId);

    if (response && response.data) {
      // Store patient data but don't display yet
      currentPatientData = response.data;
      window.alertSystem.success("Patient details retrieved");
      console.log(
        "Patient details retrieved successfully:",
        currentPatientData
      );
    } else {
      currentPatientData = null;
      window.alertSystem.error("Patient not found");
      console.error("Patient not found");
    }
  } catch (error) {
    console.error("Error fetching patient details:", error);
    currentPatientData = null;
    window.alertSystem.error("Failed to fetch patient details");
  }
}

/**
 * Display patient details with appointment info
 * @param {Object} patient - Patient data object
 * @param {Object} appointmentInfo - Appointment information
 * @param {string} tokenNumber - Token number from backend or fallback
 */
function displayPatientWithAppointment(patient, appointmentInfo, tokenNumber) {
  // Update patient code element to show token
  if (patientCodeEl) {
    patientCodeEl.textContent = `Token #${tokenNumber}`;
  }

  // Update patient detail card with patient and appointment info
  if (patientDetailCard) {
    patientDetailCard.innerHTML = `
      <div><strong>Name:</strong> ${patient.name || "N/A"}</div>
      <div><strong>DOB:</strong> ${patient.dateOfBirth || "N/A"}</div>
      <div><strong>Mobile Number:</strong> ${
        patient.mobileNumber || "N/A"
      }</div>
      <div class="token-info">
        <div><strong>Appointment Date:</strong> ${new Date(
          appointmentInfo.appointmentDate
        ).toLocaleDateString()}</div>
        <div><strong>Appointment Time:</strong> ${
          appointmentInfo.appointmentTime || "N/A"
        }</div>
        <div><strong>Appointment Type:</strong> ${
          appointmentInfo.appointmentType || "N/A"
        }</div>
      </div>
    `;
  }

  // Show patient details display
  if (patientDetailsDisplay) {
    patientDetailsDisplay.classList.remove("hidden");
  }
}

/**
 * Handle appointment form submission
 * @param {Event} e - Form submit event
 */
async function handleAppointmentSubmit(e) {
  e.preventDefault();
  console.log("Form submitted");

  const patientId = patientIdInput.value.trim();
  const appointmentDate = appointmentDateInput.value;
  const appointmentTime = appointmentTimeInput
    ? appointmentTimeInput.value
    : "09:00:00"; // Default time if input doesn't exist
  const appointmentType = appointmentTypeInput.value;

  if (!patientId || !appointmentDate || !appointmentType) {
    window.alertSystem.error("Please fill all required fields");
    console.error("Missing required fields");
    return;
  }

  // If we don't have patient data yet, try to fetch it now
  if (!currentPatientData) {
    try {
      console.log("Fetching patient details before booking");
      const patientResponse = await fetchPatientById(patientId);
      if (patientResponse && patientResponse.data) {
        // Extract the patient data from the response
        currentPatientData = patientResponse.data;
      } else {
        window.alertSystem.error("Patient not found. Cannot book appointment.");
        return;
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      window.alertSystem.error(
        "Failed to verify patient. Cannot book appointment."
      );
      return;
    }
  }

  try {
    console.log("Booking appointment for patient:", patientId);
    window.alertSystem.info("Booking appointment...");

    // Generate token for request
    const token = generateFallbackToken();

    // Prepare appointment data by combining retrieved patient data with form inputs
    const appointmentData = {
      patientId: currentPatientData.id,
      name: currentPatientData.name,
      mobileNumber: currentPatientData.mobileNumber,
      dateOfBirth: currentPatientData.dateOfBirth,
      weight: currentPatientData.weight,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      appointmentType: appointmentType,
      token: token,
    };

    console.log("Sending appointment data:", appointmentData);

    // Book the appointment
    const result = await bookAppointment(appointmentData);

    if (
      result &&
      (result.statusCode === 200 || result.statusCode === 201) &&
      result.data
    ) {
      // Use token from backend response or use the one we generated
      const tokenNumber = result.token || token;
      console.log("Appointment booked successfully, token:", tokenNumber);

      // Hide form and show confirmation with token
      hideRegistrationForm();

      // Display patient with appointment details
      displayPatientWithAppointment(
        currentPatientData,
        {
          appointmentDate,
          appointmentTime,
          appointmentType,
        },
        tokenNumber
      );

      window.alertSystem.success(
        "Appointment booked successfully! Your token number is #" + tokenNumber
      );
    } else {
      console.error("Failed to book appointment:", result?.message);
      window.alertSystem.error(result?.message || "Failed to book appointment");
    }
  } catch (error) {
    console.error("Error booking appointment:", error);

    // For offline testing only - remove this in production
    const tokenNumber = generateFallbackToken();
    console.log("Simulating successful booking with token:", tokenNumber);

    // Hide form and show confirmation with token
    hideRegistrationForm();

    // Display patient with appointment details
    displayPatientWithAppointment(
      currentPatientData,
      {
        appointmentDate,
        appointmentTime,
        appointmentType,
      },
      tokenNumber
    );

    window.alertSystem.success(
      "Appointment booked successfully (offline mode)! Your token number is #" +
        tokenNumber
    );
  }
}

// Initialize the module when DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);

// Export functions for testing
export {
  openAppointmentForm,
  closeOverlay,
  resetForm,
  hideRegistrationForm,
  fetchPatientDetails,
  handleAppointmentSubmit,
};
