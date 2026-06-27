#ifndef PRESCRIPTION_H
#define PRESCRIPTION_H

#include "medication.h"  // Include the Medication structure

// Maximum sizes for prescription-related fields
#define MAX_PRESCRIPTION_SYMPTOMS 100
#define MAX_PRESCRIPTION_FINDINGS 100
#define MAX_PRESCRIPTION_DIAGNOSIS 100
#define MAX_MEDICATIONS 10 // Maximum number of medications per prescription
#define MAX_DATE 15

// Prescription structure definition
typedef struct {
    char date[MAX_DATE];
    char symptoms[MAX_PRESCRIPTION_SYMPTOMS]; // Symptoms treated by the prescription
    char findings[MAX_PRESCRIPTION_FINDINGS];  // Medical findings related to the prescription
    char diagnosis[MAX_PRESCRIPTION_DIAGNOSIS]; // Diagnosis for the prescription
    int medicationCount;  // Number of medications in the prescription
    Medication medications[MAX_MEDICATIONS]; // Array of medications in the prescription
} Prescription;

#endif // PRESCRIPTION_H
