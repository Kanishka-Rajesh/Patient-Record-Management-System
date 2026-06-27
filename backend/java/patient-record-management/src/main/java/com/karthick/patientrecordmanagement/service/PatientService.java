package com.karthick.patientrecordmanagement.service;

import com.karthick.patientrecordmanagement.dto.PatientDTO;
import com.karthick.patientrecordmanagement.model.Patient;
import com.karthick.patientrecordmanagement.model.PatientCounter;
import com.karthick.patientrecordmanagement.repository.PatientCounterRepository;
import com.karthick.patientrecordmanagement.repository.c.PatientRepository;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    private final PatientCounterRepository counterRepository;
    private final PatientRepository patientRepository;

    public PatientService(PatientCounterRepository counterRepository, PatientRepository patientRepository) {
        this.counterRepository = counterRepository;
        this.patientRepository = patientRepository;

        counterRepository.findById(1L).orElseGet(() -> {
            PatientCounter counter = new PatientCounter();
            counter.setId(1L);
            counter.setCurrentNumber(0L);
            return counterRepository.save(counter);
        });
    }

    public PatientDTO createPatient(Patient patient) {
        PatientCounter counter = counterRepository.findById(1L).orElseThrow();
        long newNumber = counter.getCurrentNumber() + 1;
        counter.setCurrentNumber(newNumber);
        counterRepository.save(counter);

        patient.setId(newNumber);
        patient.setPrescriptions(null);

        PatientDTO dto = new PatientDTO(
                patient.getId(),
                patient.getName(),
                patient.getDateOfBirth(),
                patient.getWeight(),
                patient.getMobileNumber()
        );

        PatientDTO createdPatient = patientRepository.createPatient(dto);
        System.out.println("✅ Final DTO from C: " + createdPatient);
        return createdPatient;
    }

    public PatientDTO getPatientById(Long id) {
        if (id == null || id <= 0) {
            return null;
        }

        PatientDTO patient = patientRepository.getPatientById(id);

        if (patient != null) {
            System.out.println("✅ Found patient with ID " + id + ": " + patient);
        } else {
            System.out.println("❌ Patient with ID " + id + " not found");
        }

        return patient;
    }
}