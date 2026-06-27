#include "../patient.h"
#include "../prescription.h"
#include "../medication.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <errno.h>
#include <sys/stat.h>

// Stack Node structure
typedef struct StackNode {
    Medication medication;
    struct StackNode *next;
} StackNode;

// Stack structure
typedef struct {
    StackNode *top;
    int size;
} Stack;

// Initialize a new empty stack
Stack* createStack() {
    Stack *stack = (Stack*)malloc(sizeof(Stack));
    if (!stack) {
        perror("Failed to allocate memory for stack");
        exit(1);
    }
    stack->top = NULL;
    stack->size = 0;
    return stack;
}

// Check if stack is empty
int isEmpty(Stack *stack) {
    return stack->top == NULL;
}

// Get the size of stack
int stackSize(Stack *stack) {
    return stack->size;
}

// Push a medication onto the stack
void push(Stack *stack, Medication med) {
    StackNode *newNode = (StackNode*)malloc(sizeof(StackNode));
    if (!newNode) {
        perror("Failed to allocate memory for stack node");
        exit(1);
    }
    
    newNode->medication = med;
    newNode->next = stack->top;
    stack->top = newNode;
    stack->size++;
}

// Pop a medication from the stack
Medication pop(Stack *stack) {
    if (isEmpty(stack)) {
        fprintf(stderr, "Error: Stack underflow\n");
        exit(1);
    }
    
    StackNode *temp = stack->top;
    Medication med = temp->medication;
    stack->top = stack->top->next;
    free(temp);
    stack->size--;
    
    return med;
}

// Get all medications from the stack (destroys the stack)
Medication* getAllMedications(Stack *stack, int *count) {
    *count = stack->size;
    if (*count == 0) {
        return NULL;
    }
    
    Medication *medications = (Medication*)malloc(sizeof(Medication) * (*count));
    if (!medications) {
        perror("Failed to allocate memory for medications array");
        exit(1);
    }
    
    // Pop all items from stack in reverse order to maintain original order
    int i = *count - 1;
    while (!isEmpty(stack)) {
        medications[i--] = pop(stack);
    }
    
    return medications;
}

// Free all memory used by the stack
void freeStack(Stack *stack) {
    while (!isEmpty(stack)) {
        pop(stack);
    }
    free(stack);
}

int dirExists(const char *path) {
    struct stat info;
    if (stat(path, &info) != 0) {
        return 0; 
    }
    return (info.st_mode & S_IFDIR); 
}

void createDirIfNotExists(const char *path) {
    if (!dirExists(path)) {
        #ifdef _WIN32
        if (mkdir(path) != 0) {
            fprintf(stderr, "Error creating directory %s: %s\n", path, strerror(errno));
            exit(1);
        }
        #else
        if (mkdir(path, 0755) != 0) {
            fprintf(stderr, "Error creating directory %s: %s\n", path, strerror(errno));
            exit(1);
        }
        #endif
    }
}

void add_prescription_to_patient(long patientId, const char *symptoms, const char *findings, const char *diagnosis,
                                 int medicationCount, Medication *medications) {
    const char *folder = "E:/Final-SDP-Project/backend/c/patient/all-patient-files";
    
    createDirIfNotExists(folder);

    char filepath[512];
    snprintf(filepath, sizeof(filepath), "%s/%ld.txt", folder, patientId);

    FILE *f = fopen(filepath, "r+");
    if (f == NULL) {
        fprintf(stderr, "Error: Patient file %s does not exist. Cannot add prescription.\n", filepath);
        exit(1);
    }

    Patient patient;
    memset(&patient, 0, sizeof(Patient));

    char line[256];
    while (fgets(line, sizeof(line), f) != NULL) {
        if (strncmp(line, "ID: ", 4) == 0) {
            patient.id = atol(line + 4);
        } else if (strncmp(line, "Name: ", 6) == 0) {
            strncpy(patient.name, line + 6, MAX_PATIENT_NAME - 1);
            char *newline = strchr(patient.name, '\n');
            if (newline) *newline = '\0';
        } else if (strncmp(line, "Date of Birth: ", 15) == 0) {
            strncpy(patient.dateOfBirth, line + 15, MAX_DATE_OF_BIRTH - 1);
            char *newline = strchr(patient.dateOfBirth, '\n');
            if (newline) *newline = '\0';
        } else if (strncmp(line, "Weight: ", 8) == 0) {
            patient.weight = atof(line + 8);
        } else if (strncmp(line, "Mobile Number: ", 15) == 0) {
            strncpy(patient.mobileNumber, line + 15, MAX_PATIENT_MOBILE_NUMBER - 1);
            char *newline = strchr(patient.mobileNumber, '\n');
            if (newline) *newline = '\0';
        } else if (strncmp(line, "Prescription Count: ", 20) == 0) {
            patient.prescriptionCount = atoi(line + 20);
            break; 
        }
    }

    patient.prescriptionCount++;

    rewind(f);
    long pos = 0;
    while (fgets(line, sizeof(line), f) != NULL) {
        if (strncmp(line, "Prescription Count: ", 20) == 0) {
            fseek(f, pos, SEEK_SET);
            fprintf(f, "Prescription Count: %d\n", patient.prescriptionCount);
            break;
        }
        pos = ftell(f);
    }
    fclose(f);

    f = fopen(filepath, "a");
    if (f == NULL) {
        fprintf(stderr, "Failed to reopen patient file %s for appending: %s\n", filepath, strerror(errno));
        exit(1);
    }

    Prescription new_prescription;
    memset(&new_prescription, 0, sizeof(Prescription));

    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    strftime(new_prescription.date, sizeof(new_prescription.date), "%Y-%m-%d", t);

    strncpy(new_prescription.symptoms, symptoms, MAX_PRESCRIPTION_SYMPTOMS - 1);
    strncpy(new_prescription.findings, findings, MAX_PRESCRIPTION_FINDINGS - 1);
    strncpy(new_prescription.diagnosis, diagnosis, MAX_PRESCRIPTION_DIAGNOSIS - 1);
    new_prescription.medicationCount = medicationCount;

    fprintf(f, "=== PRESCRIPTION %d ===\n", patient.prescriptionCount);
    fprintf(f, "Date: %s\n", new_prescription.date);
    fprintf(f, "Symptoms: %s\n", new_prescription.symptoms);
    fprintf(f, "Findings: %s\n", new_prescription.findings);
    fprintf(f, "Diagnosis: %s\n", new_prescription.diagnosis);
    fprintf(f, "Medications: %d\n", medicationCount);

    for (int i = 0; i < medicationCount && i < MAX_MEDICATIONS; i++) {
        fprintf(f, "  Medication %d:\n", i + 1);
        fprintf(f, "    Name: %s\n", medications[i].name);
        fprintf(f, "    Dosage: %s\n", medications[i].dosage);
        fprintf(f, "    Duration: %s\n", medications[i].duration);
        fprintf(f, "    Notes: %s\n", medications[i].notes);
    }

    fprintf(f, "\n"); 
    fclose(f);

    printf("PRESCRIPTION_ADDED|%ld|%s|%s\n", patientId, symptoms, diagnosis);
}

int main(int argc, char *argv[]) {
    if (argc < 6) {
        fprintf(stderr, "Usage: %s <patientId> <symptoms> <findings> <diagnosis> <medication_count> [medications...]\n", argv[0]);
        return 1;
    }

    fprintf(stderr, "Starting prescription addition with %d arguments\n", argc);

    long patientId = strtol(argv[1], NULL, 10);
    const char *symptoms = argv[2];
    const char *findings = argv[3];
    const char *diagnosis = argv[4];
    int medicationCount = atoi(argv[5]);

    if (argc < 6 + (medicationCount * 4)) {
        fprintf(stderr, "Error: Not enough medication details provided.\n");
        return 1;
    }

    // Create a stack for medications
    Stack *medicationStack = createStack();
    
    // Push medications to stack in reverse order to maintain original order
    int argIndex = 6;
    for (int i = 0; i < medicationCount; i++) {
        Medication med;
        memset(&med, 0, sizeof(Medication));
        
        strncpy(med.name, argv[argIndex++], MAX_MED_NAME - 1);
        strncpy(med.dosage, argv[argIndex++], MAX_MED_DOSAGE - 1);
        strncpy(med.duration, argv[argIndex++], MAX_MED_DURATION - 1);
        strncpy(med.notes, argv[argIndex++], MAX_MED_NOTES - 1);
        
        push(medicationStack, med);
    }
    
    // Get all medications in correct order
    int actualCount;
    Medication *medications = getAllMedications(medicationStack, &actualCount);
    
    // Add prescription with medications
    add_prescription_to_patient(patientId, symptoms, findings, diagnosis, actualCount, medications);
    
    // Clean up
    free(medications);
    freeStack(medicationStack);
    
    return 0;
}