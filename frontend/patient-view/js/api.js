// api.js - Handles all API interactions and data management

// Base API URL - update this to match your server
const API_BASE_URL = "http://127.0.0.1:8080/api";

// Sample data for fallback when API is unavailable (matches exact API response format)
export const sampleData = [
  {
    id: 65,
    name: "karthick",
    dateOfBirth: "2025-04-03",
    weight: 45.0,
    mobileNumber: "93606 07300",
  },
  {
    id: 66,
    name: "karthick-2",
    dateOfBirth: "2025-04-03",
    weight: 45.0,
    mobileNumber: "93606 07300",
  },
  {
    id: 67,
    name: "karthick",
    dateOfBirth: "2025-04-02",
    weight: 34.0,
    mobileNumber: "93606 07300",
  },
  {
    id: 68,
    name: "karthick",
    dateOfBirth: "2025-04-03",
    weight: 12.0,
    mobileNumber: "93606 07300",
  },
  {
    id: 69,
    name: "karthick",
    dateOfBirth: "2025-04-03",
    weight: 67.0,
    mobileNumber: "93606 07300",
  },
];

/**
 * Fetch all patients from the API
 * @returns {Promise} Promise that resolves to patient data
 */
export async function fetchPatients() {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result; // Return complete response with statusCode, message, and data
  } catch (error) {
    console.warn("Error fetching patients:", error);
    // Return sample data wrapped in API response format
    return {
      statusCode: 200,
      message: "Patients retrieved successfully (fallback)",
      data: sampleData,
    };
  }
}
// First, add this to your api.js file

/**
 * Get prescriptions for a patient
 * @param {number} patientId - Patient ID to get prescriptions for
 * @returns {Promise} Promise that resolves to prescription data
 */
export async function fetchPrescriptionsByPatientId(patientId) {
  console.log("Fetching prescription for patient ID:", patientId);

  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`, {
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
          const normalizedPrescriptions = prescriptions.map((prescription) => {
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
          });

          resolve(normalizedPrescriptions);
        } else {
          // Handle old API response format
          const prescriptions = Array.isArray(data) ? data : [data];

          // Normalize the data structure to ensure consistent property names
          const normalizedPrescriptions = prescriptions.map((prescription) => {
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
          });

          resolve(normalizedPrescriptions);
        }
      })
      .catch((error) => {
        console.error("Error fetching prescription:", error);
        reject(error);
      });
  });
}

/**
 * Search patients by name
 * @param {string} name - Name to search for
 * @returns {Promise} Promise that resolves to matching patient data
 */
export async function searchPatientsByName(name) {
  try {
    if (!name || name.trim() === "") {
      return fetchPatients(); // If no name provided, return all patients
    }

    // Use the correct endpoint for searching patients by name
    const response = await fetch(
      `${API_BASE_URL}/prescriptions/search?name=${encodeURIComponent(name)}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result; // Return complete response with statusCode, message, and data
  } catch (error) {
    console.warn("Error searching patients:", error);
    // Filter sample data and return in API response format
    const filteredSampleData = sampleData.filter((patient) =>
      patient.name.toLowerCase().includes(name.toLowerCase())
    );

    return {
      statusCode: 200,
      message: `Patients matching "${name}" found (fallback)`,
      data: filteredSampleData,
    };
  }
}

/**
 * Create a new patient
 * @param {Object} patientData - Patient data to create
 * @returns {Promise} Promise that resolves to created patient data
 */
export async function createPatient(patientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create patient");
    }

    return result;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
}

/**
 * Generate a new unique patient code (for fallback)
 * @returns {number} A new patient ID number
 */
export function generatePatientCode() {
  return Math.floor(70 + Math.random() * 30); // Generate IDs in the range 70-99 for fallback
}

/**
 * Get mock prescription data
 * @param {number} patientId - Patient ID to get data for
 * @returns {Object} Object containing symptoms, findings, and diagnosis
 */
export function getPrescriptionData(patientId) {
  // In a real implementation, this would fetch data from the API based on patientId
  return {
    symptoms: "Fever, headache, sore throat",
    findings: "Mild fever with body ache, inflammation of the throat",
    diagnosis: "Viral fever, no complications",
    medications: "Paracetamol 500mg TID, Cetirizine 10mg OD",
  };
}

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
