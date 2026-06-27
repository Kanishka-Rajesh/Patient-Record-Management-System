#ifndef APPOINTMENT_H
#define APPOINTMENT_H

// Maximum lengths for appointment fields
#define MAX_NAME 100
#define MAX_MOBILE_NUMBER 20
#define MAX_DATE_OF_BIRTH 20
#define MAX_APPOINTMENT_DATE 20
#define MAX_APPOINTMENT_TIME 20
#define MAX_APPOINTMENT_TYPE 50
#define MAX_TOKEN 10

// Structure to store appointment information
typedef struct {
    long patientId;
    char name[MAX_NAME];
    char mobileNumber[MAX_MOBILE_NUMBER];
    char dateOfBirth[MAX_DATE_OF_BIRTH];
    double weight;
    char appointmentDate[MAX_APPOINTMENT_DATE];
    char appointmentTime[MAX_APPOINTMENT_TIME];
    char appointmentType[MAX_APPOINTMENT_TYPE];
    char token[MAX_TOKEN];
} Appointment;

#endif // APPOINTMENT_H