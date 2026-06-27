package com.karthick.patientrecordmanagement.repository;

import com.karthick.patientrecordmanagement.model.PatientCounter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientCounterRepository extends JpaRepository<PatientCounter, Long> {
}
