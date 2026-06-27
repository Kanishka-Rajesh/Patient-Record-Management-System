#ifndef PATIENT_H
#define PATIENT_H

#include "prescription.h"

#define MAX_PATIENT_NAME 100
#define MAX_PATIENT_MOBILE_NUMBER 15
#define MAX_DATE_OF_BIRTH 11


typedef struct {
    long id;
    char name[MAX_PATIENT_NAME];
    char dateOfBirth[MAX_DATE_OF_BIRTH];  // Example: YYYY-MM-DD
    double weight;
    char mobileNumber[MAX_PATIENT_MOBILE_NUMBER];
    int prescriptionCount;
    // Remove Prescription* prescriptions pointer for file I/O
} Patient;

#endif