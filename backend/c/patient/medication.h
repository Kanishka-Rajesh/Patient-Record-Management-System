#ifndef MEDICATION_H
#define MEDICATION_H

// Maximum sizes for medication fields
#define MAX_MED_NAME 50
#define MAX_MED_DOSAGE 20
#define MAX_MED_DURATION 20
#define MAX_MED_NOTES 100

// Medication structure definition
typedef struct {
    char name[MAX_MED_NAME];       // Name of the medication
    char dosage[MAX_MED_DOSAGE];   // Dosage instructions
    char duration[MAX_MED_DURATION]; // Duration of the medication course
    char notes[MAX_MED_NOTES];     // Additional notes (e.g., side effects)
} Medication;

#endif // MEDICATION_H
