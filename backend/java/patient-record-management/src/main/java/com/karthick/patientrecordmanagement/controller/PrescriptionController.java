package com.karthick.patientrecordmanagement.controller;

import com.karthick.patientrecordmanagement.dto.*;
import com.karthick.patientrecordmanagement.service.PrescriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@Slf4j
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }


    @PostMapping("/{patientId}")
    public ResponseEntity<ApiResponse<String>> createPrescription(
            @PathVariable Long patientId,
            @RequestBody PrescriptionDTO prescriptionDTO) {

        log.info("Received request to create prescription for patient ID: {}", patientId);

        try {
            boolean result = prescriptionService.createPrescription(patientId, prescriptionDTO);

            if (result) {
                ApiResponse<String> response = new ApiResponse<>(
                        HttpStatus.CREATED.value(),
                        "Prescription created successfully",
                        "Prescription added for patient ID: " + patientId
                );
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                ApiResponse<String> response = new ApiResponse<>(
                        HttpStatus.BAD_REQUEST.value(),
                        "Failed to create prescription",
                        null
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error creating prescription for patient ID {}: {}", patientId, e.getMessage());
            ApiResponse<String> response = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "An error occurred while creating the prescription: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }



    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<PatientPrescriptionsDTO>> getPrescriptionsByPatientId(@PathVariable Long patientId) {
        log.info("Received request to get all prescriptions for patient ID: {}", patientId);

        try {
            PatientPrescriptionsDTO prescriptions = prescriptionService.getPrescriptionsByPatientId(patientId);

            if (prescriptions != null) {
                ApiResponse<PatientPrescriptionsDTO> response = new ApiResponse<>(
                        HttpStatus.OK.value(),
                        "Prescriptions retrieved successfully",
                        prescriptions
                );
                return ResponseEntity.ok(response);
            } else {
                ApiResponse<PatientPrescriptionsDTO> response = new ApiResponse<>(
                        HttpStatus.NOT_FOUND.value(),
                        "Patient not found or error retrieving prescriptions for patient ID: " + patientId,
                        null
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            log.error("Error retrieving prescriptions for patient ID {}: {}", patientId, e.getMessage());
            ApiResponse<PatientPrescriptionsDTO> response = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "An error occurred while retrieving the prescriptions: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientSearchResultDTO>>> searchPatients(
            @RequestParam(required = false) String name) {

        log.info("Received request to search patients with name: {}", name);

        try {
            List<PatientSearchResultDTO> patients = prescriptionService.searchPatientsByName(name);

            ApiResponse<List<PatientSearchResultDTO>> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Patients retrieved successfully",
                    patients
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching for patients with name {}: {}", name, e.getMessage());
            ApiResponse<List<PatientSearchResultDTO>> response = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "An error occurred while searching for patients: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
