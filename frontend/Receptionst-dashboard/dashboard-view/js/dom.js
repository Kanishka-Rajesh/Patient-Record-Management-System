// dom.js

// DOM elements to interact with
export const dom = {
  refreshDashboardBtn: document.getElementById("refreshDashboardBtn"),
  totalPatients: document.getElementById("totalPatients"),
  totalAppointments: document.getElementById("totalAppointments"),
  refreshAnnouncementsBtn: document.getElementById("refreshAnnouncementsBtn"),
  doctorAnnouncementsList: document.getElementById("doctorAnnouncementsList"),
};

// Function to refresh dashboard statistics
export async function refreshStats() {
  const btn = dom.refreshDashboardBtn;
  btn.querySelector("svg").style.transform = "rotate(180deg)";

  try {
    // Fetch patient count from API
    const patientResponse = await fetch(
      "http://127.0.0.1:8080/api/patients/count"
    );
    const patientData = await patientResponse.json();
    if (patientData.statusCode === 200) {
      dom.totalPatients.textContent = patientData.data;
    } else {
      console.error("Error fetching patient count:", patientData.message);
    }

    // Fetch pending appointments from API
    const appointmentResponse = await fetch(
      "http://127.0.0.1:8080/api/patients/pending-appointments"
    );
    const appointmentData = await appointmentResponse.json();
    if (appointmentData.statusCode === 200) {
      // Update text content to reflect "Today's Pending Appointments"
      dom.totalAppointments.previousElementSibling.textContent =
        "Today's Pending Appointments";
      dom.totalAppointments.textContent = appointmentData.data;
    } else {
      console.error(
        "Error fetching pending appointments:",
        appointmentData.message
      );
    }
  } catch (error) {
    console.error("Error refreshing stats:", error);
  } finally {
    setTimeout(() => (btn.querySelector("svg").style.transform = ""), 500);
  }
}

// Function to load announcements into the UI
export function loadAnnouncements(announcements) {
  dom.doctorAnnouncementsList.innerHTML = "";
  announcements.forEach((text) => {
    const div = document.createElement("div");
    div.className = "alert-item";
    div.textContent = text;
    dom.doctorAnnouncementsList.appendChild(div);
  });
}

// Function to fetch and refresh announcements from API
export async function refreshAnnouncements() {
  const btn = dom.refreshAnnouncementsBtn;
  btn.querySelector("svg").style.transform = "rotate(180deg)";

  try {
    // Fetch announcements from API
    const response = await fetch(
      "http://127.0.0.1:8080/api/patients/announcements"
    );
    const data = await response.json();

    if (data.statusCode === 200) {
      // Assuming announcements are an array directly in data
      loadAnnouncements(data.data);
    } else {
      console.error("Error fetching announcements:", data.message);
      // Show error in the announcements list
      loadAnnouncements(["Unable to load announcements"]);
    }
  } catch (error) {
    console.error("Error refreshing announcements:", error);
    loadAnnouncements(["Connection error. Please try again later."]);
  } finally {
    setTimeout(() => (btn.querySelector("svg").style.transform = ""), 500);
  }
}

// Function to set up event listeners
export function setupEventListeners() {
  dom.refreshDashboardBtn.addEventListener("click", refreshStats);
  dom.refreshAnnouncementsBtn.addEventListener("click", refreshAnnouncements);
}

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", () => {
  // Re-initialize DOM elements to ensure they're available
  Object.assign(dom, {
    refreshDashboardBtn: document.getElementById("refreshDashboardBtn"),
    totalPatients: document.getElementById("totalPatients"),
    totalAppointments: document.getElementById("totalAppointments"),
    refreshAnnouncementsBtn: document.getElementById("refreshAnnouncementsBtn"),
    doctorAnnouncementsList: document.getElementById("doctorAnnouncementsList"),
  });

  // Set up event listeners
  setupEventListeners();

  // Initial data load
  refreshStats();
  refreshAnnouncements();
});

// This ensures the code works properly when imported as a module
if (document.readyState === "loading") {
  // Document still loading, wait for DOMContentLoaded
  // (The DOMContentLoaded listener above will handle initialization)
} else {
  // Document already loaded, initialize immediately
  setupEventListeners();
  refreshStats();
  refreshAnnouncements();
}
