// api.js - Place this in the 'js' folder

/**
 * Fetch patient information by ID
 * @param {string|number} patientId - The patient's ID
 * @returns {Promise<Object|null>} - Patient data or null if not found
 */
export async function fetchPatientById(patientId) {
  try {
    console.log(`Fetching patient with ID: ${patientId}`);
    const response = await fetch(
      `http://127.0.0.1:8080/api/patients/${patientId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      // If response status is not 2xx (success)
      if (response.status === 404) {
        console.warn(`Patient with ID ${patientId} not found`);
        return null;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Patient data retrieved:", data);
    return data;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    // Rethrow to let the calling function handle it
    throw error;
  }
}

/**
 * Book a new appointment
 * @param {Object} appointmentData - Combined patient and appointment information
 * @returns {Promise<Object>} - Booking result with status code, data and token
 */
export async function bookAppointment(appointmentData) {
  try {
    console.log("Booking appointment with data:", appointmentData);

    const response = await fetch("http://127.0.0.1:8080/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      data: response.ok ? data : null,
      token:
        response.ok && data ? data.token || data.tokenNumber || null : null,
      message: response.ok
        ? "Appointment booked successfully"
        : data.message || "Failed to book appointment",
    };
  } catch (error) {
    console.error("Error booking appointment:", error);
    return {
      statusCode: 500,
      data: null,
      token: null,
      message: "Network error while booking appointment",
    };
  }
}

/**
 * Fetch all appointment history
 * @returns {Promise<Object>} - Object containing appointment history data or error information
 */
export async function fetchAppointmentHistory() {
  try {
    console.log("Fetching appointment history");

    const response = await fetch(
      "http://127.0.0.1:8080/api/appointments/history",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Appointment history retrieved:", data);

    return {
      statusCode: response.status,
      data: data,
      message: "Appointment history retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching appointment history:", error);

    // Simulate response for offline/testing mode
    console.log("Attempting to use fallback/mock data for appointment history");

    // This is a mock response that would be similar to what we'd expect from the backend
    // In a real implementation, this would be removed or properly handled
    const mockAppointments = [
      {
        patientId: 1001,
        name: "John Smith",
        mobileNumber: "555-123-4567",
        dateOfBirth: "1980-05-15",
        weight: 75.5,
        appointmentDate: "2025-04-25",
        appointmentTime: "09:30:00",
        appointmentType: "checkup",
        token: "A123",
      },
      {
        patientId: 1002,
        name: "Jane Doe",
        mobileNumber: "555-987-6543",
        dateOfBirth: "1992-11-08",
        weight: 62.0,
        appointmentDate: "2025-04-28",
        appointmentTime: "14:15:00",
        appointmentType: "follow_up",
        token: "B456",
      },
    ];

    return {
      statusCode: 200,
      data: mockAppointments,
      message: "Mock appointment history (offline mode)",
    };
  }
}

/**
 * Generate a fallback appointment token number
 * This is only used if the backend fails to provide a token
 * @returns {string} - Generated token in format LETTER-NUMBER-NUMBER-NUMBER
 */
export function generateFallbackToken() {
  // Generate random letter A-Z
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  // Generate random 3-digit number
  const number1 = Math.floor(Math.random() * 10);
  const number2 = Math.floor(Math.random() * 10);
  const number3 = Math.floor(Math.random() * 10);

  // Format: A-123
  return `${letter}${number1}${number2}${number3}`;
}
