document.addEventListener("DOMContentLoaded", () => {
  // Selecting elements
  const addPrescriptionCard = document.getElementById("addPrescriptionCard");
  const overlay = document.getElementById("overlay");
  const cancelBtn = document.getElementById("cancelBtn");
  const addMedicationBtn = document.getElementById("addMedicationBtn");
  const medicationModal = document.getElementById("medicationModal");
  const cancelMedBtn = document.getElementById("cancelMedBtn");
  const saveMedBtn = document.getElementById("saveMedBtn");
  const medicationList = document.getElementById("medication-list");
  const registrationForm = document.getElementById("registrationForm");

  // Medication Modal Input Fields
  const medNameInput = document.getElementById("med-name");
  const medDoseInput = document.getElementById("med-dose");
  const medDurationInput = document.getElementById("med-duration");
  const medFrequencyInput = document.getElementById("med-frequency");
  const medNotesInput = document.getElementById("med-notes");

  // View Prescription elements
  const viewPrescriptionCard = document.getElementById("viewPrescriptionCard");
  const prescriptionModal = document.getElementById("prescriptionModal");
  const closePrescriptionBtn = document.getElementById("closePrescriptionBtn");
  const prescriptionPreview = document.getElementById("prescriptionPreview");

  // Patient ID Search Modal elements (to be added to HTML)
  const patientSearchModal = document.createElement("div");
  patientSearchModal.id = "patientSearchModal";
  patientSearchModal.className = "modal-overlay";
  patientSearchModal.innerHTML = `
    <div class="modal">
      <h2>View Prescriptions</h2>
      <div class="form-group">
        <label for="search-patient-id" class="form-label">Enter Patient ID *</label>
        <input type="text" class="form-input" id="search-patient-id" required />
      </div>
      <div class="form-buttons">
        <button type="button" class="btn-cancel" id="cancelSearchBtn">Cancel</button>
        <button type="button" class="btn-submit" id="searchPrescriptionBtn">Search</button>
      </div>
    </div>
  `;
  document.body.appendChild(patientSearchModal);

  // Prescription list modal
  const prescriptionListModal = document.createElement("div");
  prescriptionListModal.id = "prescriptionListModal";
  prescriptionListModal.className = "prescription-modal-overlay";
  prescriptionListModal.innerHTML = `
    <div class="prescription-modal">
      <h2>Prescription List</h2>
      <div id="prescriptionList" class="prescription-list"></div>
      <div class="prescription-form-buttons">
        <button type="button" class="prescription-btn-cancel" id="closePrescriptionListBtn">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(prescriptionListModal);

  // Prescription view modal for detailed view
  const prescriptionViewModal = document.createElement("div");
  prescriptionViewModal.id = "prescriptionViewModal";
  prescriptionViewModal.className = "prescription-modal-overlay";
  prescriptionViewModal.innerHTML = `
    <div class="prescription-modal">
      <h2>Prescription Details</h2>
      <div id="prescriptionDetails" class="prescription-preview-box"></div>
      <div class="prescription-form-buttons">
        <button type="button" class="prescription-btn-cancel" id="closePrescriptionDetailsBtn">Back to List</button>
      </div>
    </div>
  `;
  document.body.appendChild(prescriptionViewModal);

  // Get references to new elements
  const cancelSearchBtn = document.getElementById("cancelSearchBtn");
  const searchPrescriptionBtn = document.getElementById(
    "searchPrescriptionBtn"
  );
  const searchPatientIdInput = document.getElementById("search-patient-id");
  const prescriptionList = document.getElementById("prescriptionList");
  const closePrescriptionListBtn = document.getElementById(
    "closePrescriptionListBtn"
  );
  const prescriptionDetails = document.getElementById("prescriptionDetails");
  const closePrescriptionDetailsBtn = document.getElementById(
    "closePrescriptionDetailsBtn"
  );

  // Store fetched prescriptions globally for reuse
  let fetchedPrescriptions = [];

  // Array to store medication data for the current prescription
  let medications = [];

  // Open the prescription overlay when "Add Prescription" card is clicked
  addPrescriptionCard.addEventListener("click", () => {
    overlay.classList.remove("hidden");
  });

  // Close the prescription overlay
  cancelBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    // Clear the form and medications when canceling
    registrationForm.reset();
    medicationList.innerHTML = "";
    medications = [];
  });

  // Event listener to show the medication modal
  addMedicationBtn.addEventListener("click", () => {
    medicationModal.style.display = "flex";
  });

  // Close the medication modal
  cancelMedBtn.addEventListener("click", () => {
    medicationModal.style.display = "none";
    // Clear the medication inputs
    medNameInput.value = "";
    medDoseInput.value = "";
    medDurationInput.value = "";
    medFrequencyInput.value = "";
    medNotesInput.value = "";
  });

  // Add Medication to the current prescription list
  saveMedBtn.addEventListener("click", () => {
    // Validate required fields
    if (
      !medNameInput.value ||
      !medDoseInput.value ||
      !medDurationInput.value ||
      !medFrequencyInput.value
    ) {
      window.alertSystem.error("Please fill all required medication fields");
      return;
    }

    const medication = {
      name: medNameInput.value,
      dosage: medDoseInput.value,
      duration: medDurationInput.value,
      frequency: medFrequencyInput.value,
      notes: medNotesInput.value || "",
    };

    // Add medication to the medications array
    medications.push(medication);

    // Add medication to the list in the UI
    addMedicationToList(medication);

    // Clear inputs after adding
    medNameInput.value = "";
    medDoseInput.value = "";
    medDurationInput.value = "";
    medFrequencyInput.value = "";
    medNotesInput.value = "";

    // Close the modal
    medicationModal.style.display = "none";

    // Show success message
    window.alertSystem.success(
      `Medication "${medication.name}" added to prescription`
    );
  });

  // Function to add medication to the list in the UI
  function addMedicationToList(medication) {
    const medItem = document.createElement("div");
    medItem.classList.add("medication-entry");

    // Add medication details
    medItem.innerHTML = `
      <strong>${medication.name}</strong><br>
      Dosage: ${medication.dosage}<br>
      Duration: ${medication.duration} days<br>
      Frequency: ${medication.frequency} times/day<br>
      ${medication.notes ? `Notes: ${medication.notes}<br>` : ""}
      <button type="button" class="remove-btn">Remove</button>
    `;

    // Add remove functionality
    medItem.querySelector(".remove-btn").addEventListener("click", () => {
      // Remove from UI
      medItem.remove();

      // Remove from medications array
      const index = medications.findIndex(
        (med) =>
          med.name === medication.name &&
          med.dosage === medication.dosage &&
          med.duration === medication.duration &&
          med.frequency === medication.frequency
      );

      if (index !== -1) {
        medications.splice(index, 1);
        window.alertSystem.info(
          `Medication "${medication.name}" removed from prescription`
        );
      }
    });

    // Append the new medication to the list
    medicationList.appendChild(medItem);
  }

  // Form submission for the entire prescription
  registrationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate patient ID, symptoms, findings, diagnosis
    const patientId = document.getElementById("patient-id").value;
    const symptoms = document.getElementById("symptoms").value;
    const findings = document.getElementById("findings").value;
    const diagnosis = document.getElementById("Diagnosis").value;

    if (!patientId || !symptoms || !findings || !diagnosis) {
      window.alertSystem.error("Please fill all required prescription fields");
      return;
    }

    // Check if at least one medication is added
    if (medications.length === 0) {
      window.alertSystem.warning("Please add at least one medication");
      return;
    }

    // Show loading status
    window.alertSystem.info("Saving prescription...");

    // Create prescription object with all medications
    const prescription = {
      patientId,
      symptoms,
      findings,
      diagnosis,
      medications: [...medications],
      date: new Date().toISOString(),
    };

    // Send prescription data to the API
    window.api
      .savePrescription(prescription)
      .then((response) => {
        window.alertSystem.success("Prescription added successfully!");
        overlay.classList.add("hidden");

        // Reset form and medications array
        registrationForm.reset();
        medicationList.innerHTML = "";
        medications = [];
      })
      .catch((error) => {
        window.alertSystem.error(
          `Failed to add prescription: ${error.message || "Unknown error"}`
        );
        console.error("Error saving prescription:", error);
      });
  });

  // Open Patient Search Modal when "View Prescriptions" card is clicked
  viewPrescriptionCard.addEventListener("click", () => {
    patientSearchModal.style.display = "flex";
    searchPatientIdInput.focus(); // Auto-focus the input field
  });

  // Cancel Patient Search
  cancelSearchBtn.addEventListener("click", () => {
    patientSearchModal.style.display = "none";
    searchPatientIdInput.value = ""; // Clear the input
  });

  // Search for Prescriptions
  searchPrescriptionBtn.addEventListener("click", () => {
    const patientId = searchPatientIdInput.value.trim();

    if (!patientId) {
      window.alertSystem.error("Please enter a Patient ID");
      return;
    }

    // Hide the search modal
    patientSearchModal.style.display = "none";

    // Show loading message
    window.alertSystem.info(
      `Fetching prescriptions for patient ${patientId}...`
    );

    // Fetch prescriptions from API
    window.api
      .getPrescriptionByPatientId(patientId)
      .then((response) => {
        // Clear the search input
        searchPatientIdInput.value = "";

        // Store prescriptions for later use
        fetchedPrescriptions = Array.isArray(response) ? response : [response];

        // Display prescription list
        displayPrescriptionList(fetchedPrescriptions, patientId);
      })
      .catch((error) => {
        window.alertSystem.error(
          `Failed to fetch prescriptions: ${error.message || "Unknown error"}`
        );
        console.error("Error fetching prescriptions:", error);
      });
  });

  // Function to display prescription list
  function displayPrescriptionList(prescriptions, patientId) {
    // Clear previous content
    prescriptionList.innerHTML = "";

    if (!prescriptions || prescriptions.length === 0) {
      prescriptionList.innerHTML = `<div class="no-prescriptions">No prescriptions found for Patient ID: ${patientId}</div>`;
    } else {
      // Create a header element with patient information
      const headerElement = document.createElement("div");
      headerElement.className = "prescription-list-header";
      headerElement.innerHTML = `<h3>Prescriptions for Patient ID: ${patientId}</h3>`;
      prescriptionList.appendChild(headerElement);

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
            <p><strong>Diagnosis:</strong> ${
              prescription.diagnosis || "N/A"
            }</p>
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

        prescriptionList.appendChild(prescriptionSummaryEl);
      });
    }

    // Show the prescription list modal
    prescriptionListModal.style.display = "flex";
  }

  // Function to display detailed prescription
  function displayPrescriptionDetails(prescription, index, patientId) {
    // Hide the prescription list modal
    prescriptionListModal.style.display = "none";

    // Clear previous content
    prescriptionDetails.innerHTML = "";

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
      </div>
      <div class="prescription-content">
        <p><strong>Patient ID:</strong> ${
          prescription.patientId || patientId
        }</p>
        <p><strong>Symptoms:</strong> ${prescription.symptoms || "N/A"}</p>
        <p><strong>Findings:</strong> ${prescription.findings || "N/A"}</p>
        <p><strong>Diagnosis:</strong> ${prescription.diagnosis || "N/A"}</p>
        ${medsHtml}
      </div>
    `;

    prescriptionDetails.appendChild(prescriptionEl);

    // Show the detailed prescription modal
    prescriptionViewModal.style.display = "flex";
  }

  // Close prescription list modal
  if (closePrescriptionListBtn) {
    closePrescriptionListBtn.addEventListener("click", () => {
      prescriptionListModal.style.display = "none";
    });
  }

  // Back to list button from details view
  if (closePrescriptionDetailsBtn) {
    closePrescriptionDetailsBtn.addEventListener("click", () => {
      // Hide details modal
      prescriptionViewModal.style.display = "none";

      // Show list modal again
      prescriptionListModal.style.display = "flex";
    });
  }

  // Add keyboard event listener to handle Enter key press in search field
  searchPatientIdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchPrescriptionBtn.click();
    }
  });
});
