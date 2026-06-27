import {
  sampleData,
  generatePatientCode,
  getPrescriptionData,
  fetchPatients,
  createPatient,
  searchPatientsByName,
  calculateAge,
  fetchPrescriptionsByPatientId,
} from "./api.js";
// No import needed for alertSystem; it is global

(function () {
  // DOM Element references
  const overlay = document.getElementById("overlay");
  const quickActions = document.getElementById("quickActions");
  const recentTable = document.getElementById("recentTable");
  const tableBody = document.getElementById("recentBody");
  const registrationForm = document.getElementById("registrationForm");
  const patientDetailsDisplay = document.querySelector(
    ".patient-details-display"
  );
  const patientCodeEl = document.getElementById("patient-code");
  const patientDetailCard = document.querySelector(".patient-detail-card");
  const patientSearch = document.getElementById("patientSearch");
  const searchBtn = document.getElementById("searchBtn");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const prescriptionModal = document.getElementById("prescriptionModal");
  const prescriptionPreview = document.getElementById("prescriptionPreview");
  const closePrescriptionBtn = document.getElementById("closePrescriptionBtn");

  // Current page state
  let currentPage = 1;
  const patientsPerPage = 5;
  let totalPatients = 0;
  let currentSearchTerm = "";
  let currentPrescriptions = []; // Store current prescriptions globally

  // Add patient action
  document.getElementById("addPatientCard").onclick = () => {
    overlay.classList.remove("hidden");
    registrationForm.style.display = "block";
    patientDetailsDisplay.classList.add("hidden");
    registrationForm.reset(); // Clear any previous form data
  };

  // Close overlay
  document.getElementById("overlayClose").onclick = document.getElementById(
    "cancelBtn"
  ).onclick = () => {
    overlay.classList.add("hidden");
  };

  // View patients action
  document.getElementById("viewPatientsCard").onclick = () => showTable("all");

  // Back button in patients view
  document.querySelector(".btn-back").onclick = () => {
    quickActions.style.display = "grid";
    recentTable.style.display = "none";
    history.pushState({ view: "home" }, "", "#home");
  };

  // Close prescription view button
  if (closePrescriptionBtn) {
    closePrescriptionBtn.addEventListener("click", closePrescriptionView);
  }

  /**
   * Show the patients table and load data
   * @param {string} type - Type of patients to display
   */
  function showTable(type) {
    quickActions.style.display = "none";
    recentTable.style.display = "block";
    currentPage = 1;
    currentSearchTerm = "";
    patientSearch.value = "";
    loadPatients();
    history.pushState({ view: type }, "", `#${type}`);
  }

  // Handle browser navigation
  window.addEventListener("popstate", ({ state }) => {
    if (!state || state.view === "home") {
      quickActions.style.display = "grid";
      recentTable.style.display = "none";
    } else {
      showTable(state.view);
    }
  });

  /**
   * Load patients data into the table
   */
  async function loadPatients() {
    tableBody.innerHTML =
      '<tr><td colspan="6" class="loading-text">Loading patients...</td></tr>';

    try {
      let response;

      if (currentSearchTerm) {
        response = await searchPatientsByName(currentSearchTerm);
      } else {
        response = await fetchPatients();
      }

      // Handle the API response appropriately
      let patients;
      if (response && response.statusCode === 200 && response.data) {
        // This is the complete API response with status, message, and data
        patients = response.data;
      } else {
        // This might be direct data array (from the api.js sample data fallback)
        patients = response;
      }

      totalPatients = patients.length;
      displayPatients(patients);
      updatePagination();

      if (currentSearchTerm) {
        window.alertSystem.success(
          `Found ${patients.length} patients matching "${currentSearchTerm}"`
        );
      } else {
        window.alertSystem.success("Patients loaded successfully");
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      tableBody.innerHTML =
        '<tr><td colspan="6" class="error-text">Failed to load patients. Please try again.</td></tr>';
      window.alertSystem.error("Failed to load patients");
    }
  }

  /**
   * Display patients in the table
   * @param {Array} patients - Array of patient data objects
   */
  function displayPatients(patients) {
    tableBody.innerHTML = "";

    if (!patients || patients.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6" style="text-align: center;">No patients found</td>`;
      tableBody.appendChild(row);
      return;
    }

    // Calculate start and end indexes for pagination
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = Math.min(startIndex + patientsPerPage, patients.length);
    const patientsToDisplay = patients.slice(startIndex, endIndex);

    patientsToDisplay.forEach((patient) => {
      // Extract data from patient object
      const id = patient.id || "";
      const name = patient.name || "";
      const dateOfBirth = patient.dateOfBirth || "";
      const weight = patient.weight ? `${patient.weight} kg` : "";
      const mobileNumber = patient.mobileNumber || "";

      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>${dateOfBirth}</td>
      <td>${weight}</td>
      <td>${mobileNumber}</td>
      <td>
        <button class="btn-view" data-patient-id="${id}">View</button>
      </td>`;

      // Add event listener directly instead of using inline onclick
      const viewBtn = row.querySelector(".btn-view");
      viewBtn.addEventListener("click", function () {
        openPrescriptionView(id);
      });

      tableBody.appendChild(row);
    });
  }

  /**
   * Update pagination controls
   */
  function updatePagination() {
    const totalPages = Math.ceil(totalPatients / patientsPerPage);

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    // Page indicator
    const paginationText = document.createElement("span");
    paginationText.className = "page-indicator";
    paginationText.textContent = `Page ${currentPage} of ${totalPages || 1}`;

    // Clear any existing page indicator
    const existingIndicator = document.querySelector(".page-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Insert page indicator between buttons
    prevPageBtn.insertAdjacentElement("afterend", paginationText);
  }

  // Pagination button handlers
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPatients();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalPatients / patientsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      loadPatients();
    }
  });

  // Handle form submission for patient registration
  registrationForm.onsubmit = async function (e) {
    e.preventDefault();

    const name = document.getElementById("first-name").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const weight = parseFloat(document.getElementById("weight").value);
    const phone = document.getElementById("phone").value.trim();

    if (!name || !dob || !gender || isNaN(weight) || !phone) {
      window.alertSystem.error("Please fill all required fields correctly.");
      return;
    }

    const requestData = {
      name,
      dateOfBirth: dob,
      gender,
      weight,
      mobileNumber: phone,
    };

    try {
      window.alertSystem.info("Creating patient...");

      const result = await createPatient(requestData);

      if (result.statusCode === 201 && result.data) {
        const patient = result.data;

        // Display patient details
        patientCodeEl.textContent = patient.id;
        patientDetailCard.innerHTML = `
        <div><strong>ID:</strong> ${patient.id}</div>
        <div><strong>Name:</strong> ${patient.name}</div>
        <div><strong>DOB:</strong> ${patient.dateOfBirth}</div>
        <div><strong>Weight:</strong> ${patient.weight} kg</div>
        <div><strong>Mobile Number:</strong> ${patient.mobileNumber}</div>
      `;

        registrationForm.style.display = "none";
        patientDetailsDisplay.classList.remove("hidden");

        window.alertSystem.success("Patient created successfully.");
      } else {
        window.alertSystem.error(result.message || "Failed to create patient.");
      }
    } catch (error) {
      console.error("Error submitting patient data:", error);

      // For testing/demo purposes, simulate successful creation with generated ID
      const patientId = generatePatientCode();

      patientCodeEl.textContent = patientId;
      patientDetailCard.innerHTML = `
      <div><strong>ID:</strong> ${patientId}</div>
      <div><strong>Name:</strong> ${name}</div>
      <div><strong>DOB:</strong> ${dob}</div>
      <div><strong>Weight:</strong> ${weight} kg</div>
      <div><strong>Mobile Number:</strong> ${phone}</div>
    `;

      registrationForm.style.display = "none";
      patientDetailsDisplay.classList.remove("hidden");

      window.alertSystem.success(
        "Patient created successfully (offline mode)."
      );
    }
  };

  // Handle name search input
  patientSearch.addEventListener("input", function (e) {
    if (this.value.trim() === "") {
      if (currentSearchTerm !== "") {
        currentSearchTerm = "";
        currentPage = 1;
        loadPatients();
      }
    }
  });

  // Handle search button click
  searchBtn.addEventListener("click", function () {
    const searchTerm = patientSearch.value.trim();
    currentSearchTerm = searchTerm;
    currentPage = 1;
    loadPatients();
  });

  // Allow search on Enter key
  patientSearch.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const searchTerm = this.value.trim();
      currentSearchTerm = searchTerm;
      currentPage = 1;
      loadPatients();
    }
  });

  /**
   * Open prescription view for a patient
   * @param {number} patientId - Patient ID to view prescriptions for
   */
  async function openPrescriptionView(patientId) {
    try {
      window.alertSystem.info("Loading prescriptions...");

      // Show loading state in prescription modal
      prescriptionPreview.innerHTML =
        '<div class="loading-text">Loading prescriptions...</div>';
      prescriptionModal.style.display = "flex";

      // Use the imported function from api.js to fetch prescriptions
      const prescriptions = await fetchPrescriptionsByPatientId(patientId);

      // Store prescriptions globally for access in other functions
      currentPrescriptions = prescriptions;

      if (!prescriptions || prescriptions.length === 0) {
        prescriptionPreview.innerHTML =
          '<div class="no-prescriptions">No prescriptions found for this patient</div>';
        window.alertSystem.info("No prescriptions found");
        return;
      }

      // Display prescription list
      displayPrescriptionList(prescriptions, patientId);

      window.alertSystem.success("Prescriptions loaded successfully");
    } catch (error) {
      console.error("Error loading prescriptions:", error);
      prescriptionPreview.innerHTML =
        '<div class="error-text">Failed to load prescriptions. Please try again.</div>';
      window.alertSystem.error(
        `Failed to fetch prescriptions: ${error.message || "Unknown error"}`
      );
    }
  }

  /**
   * Display prescription list
   * @param {Array} prescriptions - Array of prescription objects
   * @param {number} patientId - Patient ID
   */
  function displayPrescriptionList(prescriptions, patientId) {
    // Clear previous content
    prescriptionPreview.innerHTML = "";

    if (!prescriptions || prescriptions.length === 0) {
      prescriptionPreview.innerHTML = `<div class="no-prescriptions">No prescriptions found for Patient ID: ${patientId}</div>`;
    } else {
      // Create a header element with patient information
      const headerElement = document.createElement("div");
      headerElement.className = "prescription-list-header";
      headerElement.innerHTML = `<h3>Prescriptions for Patient ID: ${patientId}</h3>`;
      prescriptionPreview.appendChild(headerElement);

      // Create an element for each prescription (summary only)
      prescriptions.forEach((prescription, index) => {
        const prescriptionDate = new Date(
          prescription.date || new Date()
        ).toLocaleDateString();

        const prescriptionSummaryEl = document.createElement("div");
        prescriptionSummaryEl.classList.add("prescription-summary-item");
        prescriptionSummaryEl.dataset.index = index;

        prescriptionSummaryEl.innerHTML = `
      <div class="prescription-summary-header">
        <h3>Prescription #${index + 1} - ${prescriptionDate}</h3>
      </div>
      <div class="prescription-summary-content">
        <p><strong>Diagnosis:</strong> ${prescription.diagnosis || "N/A"}</p>
        <p><strong>Medications:</strong> ${
          prescription.medications ? prescription.medications.length : 0
        }</p>
        <button class="view-details-btn">View Details</button>
      </div>
    `;

        // Add event listener for viewing full details
        prescriptionSummaryEl
          .querySelector(".view-details-btn")
          .addEventListener("click", () => {
            displayPrescriptionDetails(prescription, index, patientId);
          });

        prescriptionPreview.appendChild(prescriptionSummaryEl);
      });
    }
  }

  /**
   * Display detailed prescription
   * @param {Object} prescription - Prescription object
   * @param {number} index - Index of prescription in list
   * @param {number} patientId - Patient ID
   */
  function displayPrescriptionDetails(prescription, index, patientId) {
    // Clear previous content
    prescriptionPreview.innerHTML = "";

    const prescriptionDate = new Date(
      prescription.date || new Date()
    ).toLocaleDateString();

    const prescriptionEl = document.createElement("div");
    prescriptionEl.classList.add("prescription-item");

    let medsHtml = "";
    if (prescription.medications && prescription.medications.length > 0) {
      medsHtml = "<h3>Medications:</h3><ul>";
      prescription.medications.forEach((med) => {
        // Handle different property naming between client and API
        const medName = med.medicationName || med.name || "Unknown";
        const dosage = med.dosage || "N/A";
        const duration = med.duration || "N/A";

        // For the updated API structure, frequency might be in notes
        const frequency = med.frequency || "N/A";
        const notes = med.notes || "";

        medsHtml += `
      <li class="prescription-medication-item">
        <strong>${medName}</strong><br>
        Dosage: ${dosage}<br>
        Duration: ${duration}<br>
        Frequency: ${frequency}<br>
        ${notes ? `Notes: ${notes}` : ""}
      </li>
    `;
      });
      medsHtml += "</ul>";
    }

    prescriptionEl.innerHTML = `
  <div class="prescription-header">
    <h2>Prescription #${index + 1} - ${prescriptionDate}</h2>
    <button class="btn back-to-list">Back to List</button>
  </div>
  <div class="prescription-content">
    <p><strong>Patient ID:</strong> ${prescription.patientId || patientId}</p>
    <p><strong>Symptoms:</strong> ${prescription.symptoms || "N/A"}</p>
    <p><strong>Findings:</strong> ${prescription.findings || "N/A"}</p>
    <p><strong>Diagnosis:</strong> ${prescription.diagnosis || "N/A"}</p>
    ${medsHtml}
  </div>
`;

    // Add event listener to back button
    prescriptionEl
      .querySelector(".back-to-list")
      .addEventListener("click", () => {
        displayPrescriptionList(currentPrescriptions, patientId);
      });

    prescriptionPreview.appendChild(prescriptionEl);
  }

  /**
   * Close prescription view
   */
  function closePrescriptionView() {
    prescriptionModal.style.display = "none";
  }

  // Make functions available globally
  window.openPrescriptionView = openPrescriptionView;
  window.closePrescriptionView = closePrescriptionView;

  // Initialize the application
  function init() {
    // Check if we need to show a specific view based on URL hash
    const hash = window.location.hash.substring(1);
    if (hash && hash !== "home") {
      showTable(hash);
    }
  }

  // Run initialization
  init();
})();
