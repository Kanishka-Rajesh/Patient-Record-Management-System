package com.karthick.patientrecordmanagement.repository.c;

import com.karthick.patientrecordmanagement.dto.PatientDTO;
import lombok.Data;
import org.springframework.stereotype.Repository;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

@Data
@Repository
public class PatientRepository {

    private static final String EXEC_PATH =
            "E:\\Final-SDP-Project\\backend\\c\\patient\\create-patient\\create_patient.exe";

    private static final String GET_PATIENT_EXEC_PATH =
            "E:\\Final-SDP-Project\\backend\\c\\patient\\get-patient-by-id\\get_patient_by_id.exe";

    public PatientDTO createPatient(PatientDTO dto) {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                    EXEC_PATH,
                    String.valueOf(dto.getId()),
                    dto.getName(),
                    dto.getDateOfBirth(),
                    String.valueOf(dto.getWeight()),
                    dto.getMobileNumber()
            );
            builder.directory(new File("E:\\Final-SDP-Project\\backend\\c\\patient\\create-patient"));

            Process process = builder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String line;
            PatientDTO result = null;

            while ((line = reader.readLine()) != null) {
                if (line.startsWith("CREATED|")) {
                    // e.g. "CREATED|ID:47|Name:Alice Johnson|DOB:1992-04-20|Weight:64.50|Phone:9876543210|PrescriptionCount:0"
                    String[] parts = line.split("\\|");
                    if (parts.length >= 6) {
                        String idStr     = parts[1].substring(parts[1].indexOf(':') + 1);
                        String name      = parts[2].substring(parts[2].indexOf(':') + 1);
                        String dob       = parts[3].substring(parts[3].indexOf(':') + 1);
                        String weightStr = parts[4].substring(parts[4].indexOf(':') + 1);
                        String phone     = parts[5].substring(parts[5].indexOf(':') + 1);

                        result = new PatientDTO(
                                Long.parseLong(idStr),
                                name,
                                dob,
                                Double.parseDouble(weightStr),
                                phone
                        );
                    }
                }
            }

            process.waitFor();
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    public PatientDTO getPatientById(Long id) {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                    GET_PATIENT_EXEC_PATH,
                    String.valueOf(id)
            );
            builder.directory(new File("E:\\Final-SDP-Project\\backend\\c\\patient\\get-patient-by-id"));

            Process process = builder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String line;
            PatientDTO result = null;

            while ((line = reader.readLine()) != null) {
                if (line.startsWith("FOUND|")) {
                    // Format: "FOUND|id|name|dob|weight|phone"
                    String[] parts = line.split("\\|");
                    if (parts.length >= 6) {
                        result = new PatientDTO(
                                Long.parseLong(parts[1]),
                                parts[2],
                                parts[3],
                                Double.parseDouble(parts[4]),
                                parts[5]
                        );
                    }
                } else if (line.startsWith("ERROR|")) {
                    System.err.println(line);
                }
            }

            process.waitFor();
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}