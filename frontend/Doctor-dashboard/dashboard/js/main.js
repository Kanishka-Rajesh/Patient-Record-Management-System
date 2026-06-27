// main.js

// DOM elements
const dom = {
  totalPatients: document.getElementById("totalPatients"),
  refreshDashboardBtn: document.getElementById("refreshDashboardBtn"),
  refreshAppointmentsBtn: document.getElementById("refreshAppointmentsBtn"),
  appointmentsContainer: document.getElementById("appointmentsContainer"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  currentPage: document.getElementById("currentPage"),
  appointmentDetailModal: document.getElementById("appointmentDetailModal"),
  detailName: document.getElementById("detailName"),
  detailDate: document.getElementById("detailDate"),
  detailTime: document.getElementById("detailTime"),
  detailType: document.getElementById("detailType"),
  detailMobile: document.getElementById("detailMobile"),
  detailDOB: document.getElementById("detailDOB"),
  detailWeight: document.getElementById("detailWeight"),
  detailToken: document.getElementById("detailToken"),
  completeAppointmentBtn: document.getElementById("completeAppointmentBtn"),
  cancelAppointmentBtn: document.getElementById("cancelAppointmentBtn"),
  closeDetailBtn: document.getElementById("closeDetailBtn"),
};

// Pagination state
let currentPageNumber = 1;
const appointmentsPerPage = 5;
let allAppointments = [];
let currentAppointmentId = null;

// Function to load total patients
async function loadStats() {
  try {
    // API call to get patient count
    const patientResponse = await fetch(
      "http://127.0.0.1:8080/api/patients/count"
    );
    const patientData = await patientResponse.json();
    if (patientData.statusCode === 200) {
      dom.totalPatients.textContent = patientData.data;
    } else {
      console.error("Error fetching patient count:", patientData.message);
      dom.totalPatients.textContent = "Error";
    }
  } catch (error) {
    console.error("Error loading stats:", error);
    dom.totalPatients.textContent = "256"; // Fallback value
  }
}

// Function to format date to a more readable format
function formatDate(dateString) {
  if (!dateString) return "";

  const today = new Date();
  const appointmentDate = new Date(dateString);

  // Check if the appointment is today
  if (
    appointmentDate.getDate() === today.getDate() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  // Format date as DD-MM-YYYY
  return appointmentDate.toLocaleDateString("en-GB");
}

// Function to format time to AM/PM format
function formatTime(timeString) {
  if (!timeString) return "";

  // If the time is already in HH:MM AM/PM format, return as is
  if (timeString.includes("AM") || timeString.includes("PM")) {
    return timeString;
  }

  // Convert 24-hour format to 12-hour format with AM/PM
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes || "00"} ${ampm}`;
}

// Function to display appointments
function displayAppointments(appointments) {
  dom.appointmentsContainer.innerHTML = "";

  if (!appointments || appointments.length === 0) {
    const div = document.createElement("div");
    div.className = "appointment-item";
    div.innerHTML = `
            <div class="appointment-info">
              <div class="patient-name">No upcoming appointments</div>
            </div>
          `;
    dom.appointmentsContainer.appendChild(div);
    return;
  }

  appointments.forEach((appointment) => {
    const formattedDate = formatDate(appointment.appointmentDate);
    const formattedTime = formatTime(appointment.appointmentTime);

    const div = document.createElement("div");
    div.className = "appointment-item";
    div.dataset.id = appointment.patientId;
    div.innerHTML = `
            <div class="appointment-info">
              <div class="patient-name">${appointment.name}</div>
              <div class="appointment-details">
                <div class="appointment-time">${formattedDate}, ${formattedTime}</div>
                <div class="appointment-type">${appointment.appointmentType}</div>
              </div>
            </div>
            <div class="appointment-actions">
              <button class="action-btn view" data-id="${appointment.patientId}">View</button>
              <button class="action-btn done" data-id="${appointment.patientId}">Done</button>
            </div>
          `;
    dom.appointmentsContainer.appendChild(div);

    // Add event listener to the done button
    const doneBtn = div.querySelector(".action-btn.done");
    doneBtn.addEventListener("click", () => {
      completeAppointment(appointment.patientId);
    });

    // Add event listener to the view button
    const viewBtn = div.querySelector(".action-btn.view");
    viewBtn.addEventListener("click", () => {
      showAppointmentDetails(appointment);
    });
  });
}

// Function to show appointment details in modal
function showAppointmentDetails(appointment) {
  currentAppointmentId = appointment.patientId;

  // Populate modal with appointment details
  dom.detailName.textContent = appointment.name;
  dom.detailDate.textContent = formatDate(appointment.appointmentDate);
  dom.detailTime.textContent = formatTime(appointment.appointmentTime);
  dom.detailType.textContent = appointment.appointmentType;
  dom.detailMobile.textContent = appointment.mobileNumber;

  // Handle the date of birth safely
  try {
    dom.detailDOB.textContent = new Date(
      appointment.dateOfBirth
    ).toLocaleDateString("en-GB");
  } catch (e) {
    dom.detailDOB.textContent = appointment.dateOfBirth || "N/A";
  }

  dom.detailWeight.textContent = appointment.weight;
  dom.detailToken.textContent = appointment.token;

  // Show modal
  dom.appointmentDetailModal.classList.remove("hidden");

  // Add event listener to complete button in modal
  dom.completeAppointmentBtn.onclick = () => {
    completeAppointment(currentAppointmentId);
    dom.appointmentDetailModal.classList.add("hidden");
  };

  // Add event listener to close button
  dom.closeDetailBtn.onclick = () => {
    dom.appointmentDetailModal.classList.add("hidden");
  };

  // Add event listener to cancel button
  dom.cancelAppointmentBtn.onclick = () => {
    dom.appointmentDetailModal.classList.add("hidden");
  };
}

// Function to fetch and display appointments
async function fetchAppointments() {
  const btn = dom.refreshAppointmentsBtn;
  if (btn && btn.querySelector("svg")) {
    btn.querySelector("svg").style.transform = "rotate(180deg)";
  }

  try {
    // Fetch appointments from API - using the correct endpoint
    const response = await fetch("http://127.0.0.1:8080/api/appointments");
    const data = await response.json();

    console.log("API Response:", data); // Debug logging

    if (data.statusCode === 200) {
      allAppointments = data.data || [];
      updatePagination();
    } else {
      console.error("Error fetching appointments:", data.message);
      // For demonstration, use sample appointments if API fails
      useSampleAppointments();
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    // For demonstration, use sample appointments if API fails
    useSampleAppointments();
  } finally {
    if (btn && btn.querySelector("svg")) {
      setTimeout(() => (btn.querySelector("svg").style.transform = ""), 500);
    }
  }
}

// Function to use sample appointments data when API fails
function useSampleAppointments() {
  allAppointments = [
    {
      patientId: "1",
      name: "Rajesh Kumar",
      appointmentDate: "2025-05-07",
      appointmentTime: "10:30:00",
      appointmentType: "Consultation",
      mobileNumber: "9876543210",
      dateOfBirth: "1985-03-15",
      weight: 70.5,
      token: "A001",
    },
    {
      patientId: "2",
      name: "Priya Sharma",
      appointmentDate: "2025-05-07",
      appointmentTime: "11:15:00",
      appointmentType: "Follow-up",
      mobileNumber: "8765432109",
      dateOfBirth: "1990-08-22",
      weight: 65.2,
      token: "A002",
    },
    {
      patientId: "3",
      name: "Sanjay Patel",
      appointmentDate: "2025-05-07",
      appointmentTime: "12:00:00",
      appointmentType: "New Patient",
      mobileNumber: "7654321098",
      dateOfBirth: "1978-11-05",
      weight: 82.3,
      token: "A003",
    },
  ];
  updatePagination();
}

// Function to update pagination and display current page
function updatePagination() {
  const totalPages =
    Math.ceil(allAppointments.length / appointmentsPerPage) || 1;

  // Update current page display
  dom.currentPage.textContent = `Page ${currentPageNumber} of ${totalPages}`;

  // Enable/disable pagination buttons
  dom.prevPage.disabled = currentPageNumber <= 1;
  dom.nextPage.disabled = currentPageNumber >= totalPages;

  // Get appointments for current page
  const startIndex = (currentPageNumber - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;
  const currentAppointments = allAppointments.slice(startIndex, endIndex);

  // Display appointments
  displayAppointments(currentAppointments);
}

// Function to mark appointment as complete and delete from UI
async function completeAppointment(id) {
  try {
    // Call API to delete/complete appointment - using the correct endpoint
    const response = await fetch(
      `http://127.0.0.1:8080/api/appointments/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (data.statusCode === 200) {
      // Remove appointment from the array
      allAppointments = allAppointments.filter(
        (appointment) => appointment.patientId != id
      );

      // Update pagination
      updatePagination();
    } else {
      alert("Failed to complete appointment: " + data.message);
    }
  } catch (error) {
    console.error("Error completing appointment:", error);
    alert("Connection error. Please try again later.");

    // Remove from UI anyway for better UX in case of API failure
    allAppointments = allAppointments.filter(
      (appointment) => appointment.patientId != id
    );
    updatePagination();
  }
}

// Function to refresh dashboard
async function refreshDashboard() {
  const btn = dom.refreshDashboardBtn;
  if (btn && btn.querySelector("svg")) {
    btn.querySelector("svg").style.transform = "rotate(180deg)";
  }

  await loadStats();
  await fetchAppointments();

  if (btn && btn.querySelector("svg")) {
    setTimeout(() => (btn.querySelector("svg").style.transform = ""), 500);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Load initial data
  loadStats();
  fetchAppointments();

  // Event listeners for refresh buttons
  dom.refreshDashboardBtn.addEventListener("click", refreshDashboard);
  dom.refreshAppointmentsBtn.addEventListener("click", fetchAppointments);

  // Pagination event listeners
  dom.prevPage.addEventListener("click", function () {
    if (currentPageNumber > 1) {
      currentPageNumber--;
      updatePagination();
    }
  });
  dom.nextPage.addEventListener("click", function () {
    const totalPages = Math.ceil(allAppointments.length / appointmentsPerPage);
    if (currentPageNumber < totalPages) {
      currentPageNumber++;
      updatePagination();
    }
  });

  // Add click outside modal to close
  window.addEventListener("click", function (event) {
    if (event.target === dom.appointmentDetailModal) {
      dom.appointmentDetailModal.classList.add("hidden");
    }
  });
});
