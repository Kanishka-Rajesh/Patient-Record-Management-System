package com.karthick.patientrecordmanagement.controller;

import com.karthick.patientrecordmanagement.dto.AppointmentDTO;
import com.karthick.patientrecordmanagement.dto.ApiResponse;
import com.karthick.patientrecordmanagement.dto.AppointmentResponseDTO;
import com.karthick.patientrecordmanagement.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Get all appointments endpoint.
     *
     * @return ResponseEntity with appointment data
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getAllAppointments() {
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.findAllAppointments();
            return ResponseEntity.ok(new ApiResponse<>(
                    200,
                    "Appointments retrieved successfully",
                    appointments
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            500,
                            "Error retrieving appointments: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Create new appointment endpoint.
     *
     * @param appointmentDTO The appointment data
     * @return ResponseEntity with operation result
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Boolean>> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        try {
            boolean result = appointmentService.saveAppointment(appointmentDTO);
            if (result) {
                return ResponseEntity.ok(new ApiResponse<>(
                        200,
                        "Appointment created successfully",
                        true
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(
                                400,
                                "Failed to create appointment",
                                false
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            500,
                            "Error creating appointment: " + e.getMessage(),
                            false
                    ));
        }
    }

    /**
     * Delete appointment endpoint.
     *
     * @param patientId The patient ID of the appointment to delete
     * @return ResponseEntity with operation result
     */
    @DeleteMapping("/{patientId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteAppointment(@PathVariable String patientId) {
        try {
            boolean result = appointmentService.deleteAppointment(patientId);
            if (result) {
                return ResponseEntity.ok(new ApiResponse<>(
                        200,
                        "Appointment deleted successfully",
                        true
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                404,
                                "Appointment not found or could not be deleted",
                                false
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            500,
                            "Error deleting appointment: " + e.getMessage(),
                            false
                    ));
        }
    }
}