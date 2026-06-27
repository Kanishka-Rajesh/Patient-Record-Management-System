package com.karthick.patientrecordmanagement.service;

import com.karthick.patientrecordmanagement.dto.AppointmentDTO;
import com.karthick.patientrecordmanagement.dto.AppointmentResponseDTO;
import com.karthick.patientrecordmanagement.repository.c.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Get all appointments.
     *
     * @return List of appointment objects
     */
    public List<AppointmentResponseDTO> findAllAppointments() {
        return appointmentRepository.findAll();
    }

    /**
     * Save a new appointment.
     *
     * @param appointmentDTO the appointment data to save
     * @return true if successful, false otherwise
     */
    public boolean saveAppointment(AppointmentDTO appointmentDTO) {
        return appointmentRepository.save(appointmentDTO);
    }

    /**
     * Delete an appointment by ID.
     *
     * @param appointmentId the ID of the appointment to delete
     * @return true if successful, false otherwise
     */
    public boolean deleteAppointment(String appointmentId) {
        return appointmentRepository.delete(appointmentId);
    }
}