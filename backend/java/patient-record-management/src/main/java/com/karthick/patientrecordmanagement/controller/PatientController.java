package com.karthick.patientrecordmanagement.controller;

import com.karthick.patientrecordmanagement.dto.PatientDTO;
import com.karthick.patientrecordmanagement.dto.ApiResponse;
import com.karthick.patientrecordmanagement.model.Patient;
import com.karthick.patientrecordmanagement.model.PatientCounter;
import com.karthick.patientrecordmanagement.repository.PatientCounterRepository;
import com.karthick.patientrecordmanagement.service.PatientService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@AllArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final PatientCounterRepository patientCounterRepository;

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getPatientCount() {
        PatientCounter counter = patientCounterRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Patient counter not initialized"));

        ApiResponse<Long> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Patient count retrieved successfully",
                counter.getCurrentNumber()
        );

        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);

        if (patient == null) {
            ApiResponse<PatientDTO> errorResponse = new ApiResponse<>(
                    HttpStatus.NOT_FOUND.value(),
                    "Patient with ID " + id + " not found",
                    null
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        ApiResponse<PatientDTO> successResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Patient retrieved successfully",
                patient
        );

        return ResponseEntity.ok(successResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDTO>> createPatient(@RequestBody Patient patient) {
        PatientDTO created = patientService.createPatient(patient);

        if (created == null) {
            ApiResponse<PatientDTO> errorResponse = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to create patient",
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }

        ApiResponse<PatientDTO> successResponse = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Patient created successfully",
                created
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);
    }
}