package com.karthick.patientrecordmanagement.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientCounter {

    @Id
    private Long id = 1L; // No @GeneratedValue — this is always 1

    private Long currentNumber;
}
