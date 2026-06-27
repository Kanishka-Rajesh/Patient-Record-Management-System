package com.karthick.patientrecordmanagement.service;

import com.karthick.patientrecordmanagement.dto.PatientPrescriptionsDTO;
import com.karthick.patientrecordmanagement.dto.PatientSearchResultDTO;
import com.karthick.patientrecordmanagement.dto.PrescriptionDTO;
import com.karthick.patientrecordmanagement.repository.c.PrescriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    @Autowired
    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    public boolean createPrescription(Long patientId, PrescriptionDTO prescriptionDTO) {
        log.info("Creating prescription for patient: {}", patientId);

        if (!validatePrescriptionData(prescriptionDTO)) {
            log.error("Invalid prescription data for patient: {}", patientId);
            return false;
        }

        boolean result = prescriptionRepository.savePrescription(patientId, prescriptionDTO);

        if (result) {
            log.info("Successfully created prescription for patient: {}", patientId);
        } else {
            log.error("Failed to create prescription for patient: {}", patientId);
        }

        return result;
    }



    public PatientPrescriptionsDTO getPrescriptionsByPatientId(Long patientId) {
        log.info("Retrieving prescriptions for patient: {}", patientId);


        PatientPrescriptionsDTO prescriptions = prescriptionRepository.getPrescriptionsByPatientId(patientId);

        if (prescriptions == null) {
            log.warn("No prescriptions found for patient: {}", patientId);
        } else {
            log.info("Found {} prescriptions for patient: {}",
                    prescriptions.getPrescriptionCount(), patientId);
        }

        return prescriptions;
    }

    private boolean validatePrescriptionData(PrescriptionDTO prescriptionDTO) {

        if (prescriptionDTO.getSymptoms() == null || prescriptionDTO.getSymptoms().trim().isEmpty()) {
            log.error("Symptoms cannot be empty");
            return false;
        }

        if (prescriptionDTO.getDiagnosis() == null || prescriptionDTO.getDiagnosis().trim().isEmpty()) {
            log.error("Diagnosis cannot be empty");
            return false;
        }

        if (prescriptionDTO.getMedications() == null || prescriptionDTO.getMedications().isEmpty()) {
            log.error("At least one medication must be provided");
            return false;
        }

        for (int i = 0; i < prescriptionDTO.getMedications().size(); i++) {
            var medication = prescriptionDTO.getMedications().get(i);

            if (medication.getMedicationName() == null || medication.getMedicationName().trim().isEmpty()) {
                log.error("Medication name cannot be empty for medication at index: {}", i);
                return false;
            }

            if (medication.getDosage() <= 0) {
                log.error("Invalid dosage for medication '{}': {}", medication.getMedicationName(), medication.getDosage());
                return false;
            }

            if (medication.getDuration() <= 0) {
                log.error("Invalid duration for medication '{}': {}", medication.getMedicationName(), medication.getDuration());
                return false;
            }

            if (medication.getFrequency() <= 0) {
                log.error("Invalid frequency for medication '{}': {}", medication.getMedicationName(), medication.getFrequency());
                return false;
            }
        }

        return true;
    }

    public List<PatientSearchResultDTO> searchPatientsByName(String searchName) {
        log.info("Searching for patients with name containing: {}", searchName);

        List<PatientSearchResultDTO> searchResults = prescriptionRepository.searchPatientsByName(searchName);

        log.info("Found {} patients matching search criteria: {}", searchResults.size(), searchName);

        return searchResults;
    }
}