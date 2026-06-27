const api = {
  // Function to save prescription data
  savePrescription: function (prescription) {
    console.log("Saving prescription for patient ID:", prescription.patientId);
    console.log("Prescription data:", JSON.stringify(prescription, null, 2));

    return new Promise((resolve, reject) => {
      // Transform the medication data to match the expected API format
      const requestPayload = {
        symptoms: prescription.symptoms,
        findings: prescription.findings,
        diagnosis: prescription.diagnosis,
        medications: prescription.medications.map((med) => ({
          medicationName: med.name, // Changed from med.medicationName to med.name
          dosage:
            typeof med.dosage === "number"
              ? med.dosage
              : parseInt(med.dosage, 10) || 0,
          duration:
            typeof med.duration === "number"
              ? med.duration
              : parseInt(med.duration, 10) || 0,
          frequency:
            typeof med.frequency === "number"
              ? med.frequency
              : parseInt(med.frequency, 10) || 0, // Properly handle frequency
          notes: med.notes || "",
        })),
      };

      fetch(
        `http://127.0.0.1:8080/api/prescriptions/${prescription.patientId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestPayload),
          credentials: "include", // Include cookies if needed for authentication
        }
      )
        .then((response) => {
          if (!response.ok) {
            // Convert non-2xx HTTP responses into errors
            return response.text().then((text) => {
              throw new Error(
                `Server responded with ${response.status}: ${text}`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Prescription saved successfully:", data);
          resolve(data);
        })
        .catch((error) => {
          console.error("Error saving prescription:", error);
          reject(error);
        });
    });
  },

  // Function to get prescription by patient ID
  getPrescriptionByPatientId: function (patientId) {
    console.log("Fetching prescription for patient ID:", patientId);

    return new Promise((resolve, reject) => {
      fetch(`http://127.0.0.1:8080/api/prescriptions/patient/${patientId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include", // Include cookies if needed for authentication
      })
        .then((response) => {
          if (!response.ok) {
            // Convert non-2xx HTTP responses into errors
            return response.text().then((text) => {
              throw new Error(
                `Server responded with ${response.status}: ${text}`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Prescription fetched successfully:", data);

          // Check if we have the new API response format
          if (data.statusCode === 200 && data.data) {
            // New API response format
            const prescriptions = data.data.prescriptions || [];

            // Map the new API response format to our expected format
            const normalizedPrescriptions = prescriptions.map(
              (prescription) => {
                return {
                  patientId: data.data.patientId,
                  symptoms: prescription.symptoms || "",
                  findings: prescription.findings || "",
                  diagnosis: prescription.diagnosis || "",
                  date: prescription.date || new Date().toISOString(),
                  medications: (prescription.medications || []).map((med) => ({
                    name: med.name || "",
                    medicationName: med.name || "",
                    dosage: med.dosage || "0",
                    duration: med.duration || "0",
                    frequency: med.notes || "0", // Note: Using notes as frequency based on your API response
                    notes: "", // Leaving notes empty as it's combined with frequency in your API
                  })),
                };
              }
            );

            resolve(normalizedPrescriptions);
          } else {
            // Handle old API response format
            const prescriptions = Array.isArray(data) ? data : [data];

            // Normalize the data structure to ensure consistent property names
            const normalizedPrescriptions = prescriptions.map(
              (prescription) => {
                return {
                  patientId: prescription.patientId || patientId,
                  symptoms: prescription.symptoms || "",
                  findings: prescription.findings || "",
                  diagnosis: prescription.diagnosis || "",
                  date: prescription.date || new Date().toISOString(),
                  medications: (prescription.medications || []).map((med) => ({
                    name: med.medicationName || med.name || "",
                    medicationName: med.medicationName || med.name || "",
                    dosage: med.dosage || "0",
                    duration: med.duration || "0",
                    frequency: med.frequency || "0",
                    notes: med.notes || "",
                  })),
                };
              }
            );

            resolve(normalizedPrescriptions);
          }
        })
        .catch((error) => {
          console.error("Error fetching prescription:", error);
          reject(error);
        });
    });
  },
};

// Make the API available globally
window.api = api;

export default api;
