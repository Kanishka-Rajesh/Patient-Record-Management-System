package com.karthick.patientrecordmanagement.repository.c;

import com.karthick.patientrecordmanagement.dto.MedicationDTO;
import com.karthick.patientrecordmanagement.dto.MedicationResponseDTO;
import com.karthick.patientrecordmanagement.dto.PatientPrescriptionsDTO;
import com.karthick.patientrecordmanagement.dto.PrescriptionDTO;
import com.karthick.patientrecordmanagement.dto.PrescriptionResponseDTO;
import com.karthick.patientrecordmanagement.dto.PatientSearchResultDTO;
import lombok.Data;
import org.springframework.stereotype.Repository;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Data
@Repository
public class PrescriptionRepository {

    private static final String EXEC_PATH =
            "E:/Final-SDP-Project/backend/c/patient/create-prescription/create_prescription.exe";

    private static final String GET_EXEC_PATH =
            "E:/Final-SDP-Project/backend/c/patient/get-prescription-id/get_prescription.exe";

    private static final String SEARCH_PATIENT_EXEC_PATH =
            "E:/Final-SDP-Project/backend/c/patient/search-patient-by-name/search_patient_by_name.exe";

    public boolean savePrescription(Long patientId, PrescriptionDTO prescriptionDTO) {
        Process process = null;
        try {
            List<String> command = buildCommand(patientId, prescriptionDTO);

            System.out.println("Executing command: " + String.join(" ", command));

            ProcessBuilder builder = new ProcessBuilder(command);

            builder.directory(new File("E:/Final-SDP-Project/backend/c/patient/create-prescription"));

            builder.redirectErrorStream(true);

            process = builder.start();

            return processOutput(process);

        } catch (Exception e) {
            System.err.println("Error executing prescription creation: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }


    private List<String> buildCommand(Long patientId, PrescriptionDTO prescriptionDTO) {
        List<String> command = new ArrayList<>();


        command.add(EXEC_PATH);

        command.add(String.valueOf(patientId));

        command.add(prescriptionDTO.getSymptoms().replace(" ", "_"));
        command.add(prescriptionDTO.getFindings().replace(" ", "_"));
        command.add(prescriptionDTO.getDiagnosis().replace(" ", "_"));

        command.add(String.valueOf(prescriptionDTO.getMedications().size()));

        for (MedicationDTO medication : prescriptionDTO.getMedications()) {
            command.add(medication.getMedicationName().replace(" ", "_"));
            command.add(medication.getDosage() + "mg");
            command.add(medication.getDuration() + "_days");
            command.add(medication.getFrequency() + "_times_daily");
        }

        return command;
    }

    private boolean processOutput(Process process) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        boolean success = false;
        StringBuilder output = new StringBuilder();

        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
            System.out.println("C Program Output: " + line);

            if (line.startsWith("PRESCRIPTION_ADDED|")) {
                success = true;
            }
        }

        int exitCode = process.waitFor();
        System.out.println("C Program Exit Code: " + exitCode);

        // If the exit code is not 0, the program failed
        if (exitCode != 0) {
            System.err.println("C program failed with exit code " + exitCode);
            System.err.println("Output: " + output.toString());
            return false;
        }

        return success;
    }


    public PatientPrescriptionsDTO getPrescriptionsByPatientId(Long patientId) {
        Process process = null;
        try {
            List<String> command = new ArrayList<>();
            command.add(GET_EXEC_PATH);
            command.add(String.valueOf(patientId));

            System.out.println("Executing command: " + String.join(" ", command));

            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(new File("E:/Final-SDP-Project/backend/c/patient/get-prescription-id"));
            builder.redirectErrorStream(true);
            process = builder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;

            PatientPrescriptionsDTO result = null;
            Map<Integer, PrescriptionResponseDTO> prescriptionMap = new HashMap<>();

            while ((line = reader.readLine()) != null) {
                System.out.println("C Program Output: " + line);

                if (!line.startsWith("PATIENT_") && !line.startsWith("NO_") &&
                        !line.startsWith("ERROR_") && !line.startsWith("PRESCRIPTIONS_") &&
                        !line.startsWith("PRESCRIPTION|") && !line.startsWith("MEDICATION|")) {
                    continue;
                }

                if (line.startsWith("PATIENT_NOT_FOUND|")) {
                    System.out.println("Patient not found: " + patientId);
                    return null;
                }
                else if (line.startsWith("NO_PRESCRIPTIONS|")) {
                    System.out.println("No prescriptions found for patient: " + patientId);
                    return new PatientPrescriptionsDTO(patientId, 0, new ArrayList<>());
                }
                else if (line.startsWith("ERROR_READING_PATIENT|")) {
                    System.err.println("Error reading patient data: " + patientId);
                    return null;
                }
                else if (line.startsWith("PRESCRIPTIONS_FOUND|")) {
                    // Format: PRESCRIPTIONS_FOUND|patientId|count
                    String[] parts = line.split("\\|");
                    Long pId = Long.parseLong(parts[1]);
                    int count = Integer.parseInt(parts[2]);
                    result = new PatientPrescriptionsDTO(pId, count, new ArrayList<>());
                }
                else if (line.startsWith("PRESCRIPTION|")) {
                    try {
                        // Format: PRESCRIPTION|index|date|symptoms|findings|diagnosis|medicationCount
                        String[] parts = line.split("\\|");
                        if (parts.length < 7) {
                            System.err.println("Invalid prescription format: " + line);
                            continue;
                        }

                        int index = Integer.parseInt(parts[1]);
                        String date = parts[2];
                        String symptoms = parts[3];
                        String findings = parts[4];
                        String diagnosis = parts[5];
                        int medicationCount = Integer.parseInt(parts[6]);

                        PrescriptionResponseDTO prescription = new PrescriptionResponseDTO(
                                date, symptoms, findings, diagnosis, medicationCount, new ArrayList<>());

                        prescriptionMap.put(index, prescription);
                        System.out.println("Added prescription: " + index + " with " + medicationCount + " medications");
                    } catch (Exception e) {
                        System.err.println("Error parsing prescription line: " + line);
                        System.err.println("Exception: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                else if (line.startsWith("MEDICATION|")) {
                    try {
                        // Format: MEDICATION|prescriptionIndex|medicationIndex|name|dosage|duration|notes
                        String[] parts = line.split("\\|");
                        if (parts.length < 7) {
                            System.err.println("Invalid medication format: " + line);
                            continue;
                        }

                        int prescriptionIndex = Integer.parseInt(parts[1]);
                        int medicationIndex = Integer.parseInt(parts[2]);
                        String name = parts[3]; // No need to replace underscores, done in C code
                        String dosage = parts[4];
                        String duration = parts[5];
                        String notes = parts[6];

                        MedicationResponseDTO medication = new MedicationResponseDTO(
                                name, dosage, duration, notes);

                        PrescriptionResponseDTO prescription = prescriptionMap.get(prescriptionIndex);
                        if (prescription != null) {
                            prescription.getMedications().add(medication);
                            System.out.println("Added medication: " + name + " to prescription " + prescriptionIndex);
                        } else {
                            System.err.println("Prescription not found for medication: " + prescriptionIndex);
                        }
                    } catch (Exception e) {
                        System.err.println("Error parsing medication line: " + line);
                        System.err.println("Exception: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                else if (line.startsWith("ERROR_READING_PRESCRIPTION|")) {
                    System.err.println("Error reading prescription: " + line);

                }
            }

            int exitCode = process.waitFor();
            System.out.println("C Program Exit Code: " + exitCode);

            if (exitCode != 0) {
                System.err.println("C program failed with exit code " + exitCode);
                return null;
            }

            if (result != null) {

                for (int i = 0; i < prescriptionMap.size(); i++) {
                    PrescriptionResponseDTO prescription = prescriptionMap.get(i);
                    if (prescription != null) {
                        result.getPrescriptions().add(prescription);
                        System.out.println("Final prescription " + i + " has " +
                                prescription.getMedications().size() + " medications");
                    }
                }
                return result;
            }

            return null;

        } catch (Exception e) {
            System.err.println("Error retrieving prescriptions for patient " + patientId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }


    public List<PatientSearchResultDTO> searchPatientsByName(String searchName) {
        Process process = null;
        List<PatientSearchResultDTO> searchResults = new ArrayList<>();

        try {
            List<String> command = new ArrayList<>();
            command.add(SEARCH_PATIENT_EXEC_PATH);

            if (searchName != null && !searchName.trim().isEmpty()) {
                command.add(searchName.trim());
            }

            System.out.println("Executing search command: " + String.join(" ", command));

            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(new File("E:/Final-SDP-Project/backend/c/patient/search-patient-by-name"));
            builder.redirectErrorStream(true);
            process = builder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            boolean insideSearchResults = false;

            while ((line = reader.readLine()) != null) {
                System.out.println("C Program Output: " + line);

                if (line.startsWith("SEARCH_RESULTS_START")) {
                    insideSearchResults = true;
                    continue;
                } else if (line.startsWith("SEARCH_RESULTS_END")) {
                    insideSearchResults = false;
                    continue;
                }

                if (insideSearchResults) {
                    try {
                        String[] parts = line.split("\\|");
                        if (parts.length < 5) {
                            System.err.println("Invalid patient search result format: " + line);
                            continue;
                        }

                        Long id = Long.parseLong(parts[0]);
                        String name = parts[1];
                        String dateOfBirth = parts[2];
                        double weight = Double.parseDouble(parts[3]);
                        String mobileNumber = parts[4];

                        PatientSearchResultDTO patient = new PatientSearchResultDTO(
                                id, name, dateOfBirth, weight, mobileNumber);

                        searchResults.add(patient);
                        System.out.println("Added patient to search results: " + name + " (ID: " + id + ")");

                    } catch (Exception e) {
                        System.err.println("Error parsing patient search result line: " + line);
                        System.err.println("Exception: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }

            int exitCode = process.waitFor();
            System.out.println("C Program Exit Code: " + exitCode);

            if (exitCode != 0) {
                System.err.println("C program failed with exit code " + exitCode);
                return searchResults;
            }

            return searchResults;

        } catch (Exception e) {
            System.err.println("Error searching for patients: " + e.getMessage());
            e.printStackTrace();
            return searchResults;
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }
}