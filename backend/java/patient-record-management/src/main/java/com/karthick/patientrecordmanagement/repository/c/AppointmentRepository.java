package com.karthick.patientrecordmanagement.repository.c;

import com.karthick.patientrecordmanagement.dto.AppointmentDTO;
import com.karthick.patientrecordmanagement.dto.AppointmentResponseDTO;
import lombok.Data;
import org.springframework.stereotype.Repository;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.List;
import java.util.ArrayList;

@Data
@Repository
public class AppointmentRepository {

    // Updated paths to use Unix-style paths
    private static final String FIND_ALL_EXEC_PATH =
            "E:\\Final-SDP-Project\\backend\\c\\appointment\\get-all-appointments\\get_all_appointments.exe";

    private static final String SAVE_EXEC_PATH =
            "E:\\Final-SDP-Project\\backend\\c\\appointment\\add-appointment\\add_appointment.exe";

    private static final String DELETE_EXEC_PATH =
            "E:\\Final-SDP-Project\\backend\\c\\appointment\\delete-appointment\\delete_appointment.exe";

    /**
     * Retrieves all appointments.
     *
     * @return List of appointment objects
     */
    public List<AppointmentResponseDTO> findAll() {
        Process process = null;
        List<AppointmentResponseDTO> appointments = new ArrayList<>();

        try {
            List<String> command = new ArrayList<>();
            command.add(FIND_ALL_EXEC_PATH);

            System.out.println("Executing command: " + String.join(" ", command));

            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(new File("E:\\Final-SDP-Project\\backend\\c\\appointment\\get-all-appointments\\"));
            builder.redirectErrorStream(true);
            process = builder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;

            while ((line = reader.readLine()) != null) {
                System.out.println("C Program Output: " + line);

                if (line.startsWith("APPOINTMENT|")) {
                    // Format: APPOINTMENT|id|name|mobile|dob|weight|date|time|type|token
                    String[] parts = line.split("\\|");
                    if (parts.length < 10) {
                        System.err.println("Invalid appointment format: " + line);
                        continue;
                    }

                    // Convert id string to Long patientId
                    Long patientId;
                    try {
                        patientId = Long.parseLong(parts[1]);
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid patient ID format: " + parts[1]);
                        patientId = 0L; // Default value if parsing fails
                    }

                    // Parse weight as Double
                    Double weight;
                    try {
                        weight = Double.parseDouble(parts[5]);
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid weight format: " + parts[5]);
                        weight = 0.0; // Default value if parsing fails
                    }

                    String name = parts[2];
                    String mobileNumber = parts[3];
                    String dateOfBirth = parts[4];
                    String appointmentDate = parts[6];
                    String appointmentTime = parts[7];
                    String appointmentType = parts[8];
                    String token = parts[9];

                    AppointmentResponseDTO appointment = new AppointmentResponseDTO(
                            patientId, name, mobileNumber, dateOfBirth, weight,
                            appointmentDate, appointmentTime, appointmentType, token);
                    appointments.add(appointment);
                }
                else if (line.startsWith("NO_APPOINTMENTS|")) {
                    System.out.println("No appointments found");
                    return new ArrayList<>();
                }
                else if (line.startsWith("ERROR_READING_APPOINTMENTS|")) {
                    System.err.println("Error reading appointments data");
                    return new ArrayList<>();
                }
            }

            int exitCode = process.waitFor();
            System.out.println("C Program Exit Code: " + exitCode);

            if (exitCode != 0) {
                System.err.println("C program failed with exit code " + exitCode);
                return new ArrayList<>();
            }

            return appointments;

        } catch (Exception e) {
            System.err.println("Error retrieving appointments: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    /**
     * Saves a new appointment.
     *
     * @param appointmentDTO the appointment data to save
     * @return true if successful, false otherwise
     */
    public boolean save(AppointmentDTO appointmentDTO) {
        Process process = null;
        try {
            List<String> command = buildSaveCommand(appointmentDTO);

            System.out.println("Executing command: " + String.join(" ", command));

            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(new File("E:\\Final-SDP-Project\\backend\\c\\appointment\\add-appointment"));
            builder.redirectErrorStream(true);
            process = builder.start();

            return processSaveOutput(process);

        } catch (Exception e) {
            System.err.println("Error executing appointment creation: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    private List<String> buildSaveCommand(AppointmentDTO appointmentDTO) {
        List<String> command = new ArrayList<>();

        command.add(SAVE_EXEC_PATH);

        // Add patientId to command if present
        if (appointmentDTO.getPatientId() != null) {
            command.add(appointmentDTO.getPatientId().toString());
        } else {
            command.add("0"); // Use 0 or some default value if patientId is not provided
        }

        command.add(appointmentDTO.getName().replace(" ", "_"));
        command.add(appointmentDTO.getMobileNumber() != null ?
                appointmentDTO.getMobileNumber().replace(" ", "_") : "None");
        command.add(appointmentDTO.getDateOfBirth() != null ?
                appointmentDTO.getDateOfBirth().replace(" ", "_") : "None");
        command.add(appointmentDTO.getWeight() != null ?
                appointmentDTO.getWeight().toString() : "0");
        command.add(appointmentDTO.getAppointmentDate().replace(" ", "_"));
        command.add(appointmentDTO.getAppointmentTime().replace(" ", "_"));
        command.add(appointmentDTO.getAppointmentType().replace(" ", "_"));
        command.add(appointmentDTO.getToken() != null ?
                appointmentDTO.getToken().replace(" ", "_") : "None");

        return command;
    }

    private boolean processSaveOutput(Process process) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        boolean success = false;
        StringBuilder output = new StringBuilder();

        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
            System.out.println("C Program Output: " + line);

            if (line.startsWith("APPOINTMENT_ADDED|")) {
                success = true;
            }
        }

        int exitCode = process.waitFor();
        System.out.println("C Program Exit Code: " + exitCode);

        if (exitCode != 0) {
            System.err.println("C program failed with exit code " + exitCode);
            System.err.println("Output: " + output.toString());
            return false;
        }

        return success;
    }

    /**
     * Deletes an appointment by patient ID.
     *
     * @param patientId the patient ID of the appointment to delete
     * @return true if successful, false otherwise
     */
    public boolean delete(String patientId) {
        Process process = null;
        try {
            List<String> command = new ArrayList<>();
            command.add(DELETE_EXEC_PATH);
            command.add(patientId);

            System.out.println("Executing command: " + String.join(" ", command));

            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(new File("E:\\Final-SDP-Project\\backend\\c\\appointment\\delete-appointment"));
            builder.redirectErrorStream(true);
            process = builder.start();

            return processDeleteOutput(process);

        } catch (Exception e) {
            System.err.println("Error executing appointment deletion: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    private boolean processDeleteOutput(Process process) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        boolean success = false;
        StringBuilder output = new StringBuilder();

        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
            System.out.println("C Program Output: " + line);

            if (line.startsWith("APPOINTMENT_DELETED|")) {
                success = true;
            }
            else if (line.startsWith("APPOINTMENT_NOT_FOUND|")) {
                System.err.println("Appointment not found with patient ID: " + line.split("\\|")[1]);
                return false;
            }
        }

        int exitCode = process.waitFor();
        System.out.println("C Program Exit Code: " + exitCode);

        if (exitCode != 0) {
            System.err.println("C program failed with exit code " + exitCode);
            System.err.println("Output: " + output.toString());
            return false;
        }

        return success;
    }
}