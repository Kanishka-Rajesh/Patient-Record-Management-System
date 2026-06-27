#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "../patient.h"

#define TABLE_SIZE 1000

// Node structure for our hashmap
typedef struct PatientNode {
    Patient patient;
    long id;
    struct PatientNode *next;
} PatientNode;

// Hashmap structure
typedef struct {
    PatientNode *table[TABLE_SIZE];
    int size;
} HashMap;

// Hash function
unsigned int hash(long id) {
    return id % TABLE_SIZE;
}

// Initialize hashmap
void hashmap_init(HashMap *map) {
    for (int i = 0; i < TABLE_SIZE; i++) {
        map->table[i] = NULL;
    }
    map->size = 0;
}

// Insert a patient into the hashmap
void hashmap_insert(HashMap *map, Patient *p) {
    unsigned int index = hash(p->id);
    
    PatientNode *new_node = (PatientNode*)malloc(sizeof(PatientNode));
    if (!new_node) {
        fprintf(stderr, "Memory allocation failed\n");
        return;
    }
    
    memcpy(&new_node->patient, p, sizeof(Patient));
    new_node->id = p->id;
    new_node->next = map->table[index];
    
    map->table[index] = new_node;
    map->size++;
}

// Get a patient by ID from the hashmap
int hashmap_get(HashMap *map, long id, Patient *p) {
    unsigned int index = hash(id);
    PatientNode *current = map->table[index];
    
    while (current != NULL) {
        if (current->id == id) {
            memcpy(p, &current->patient, sizeof(Patient));
            return 1;
        }
        current = current->next;
    }
    
    return 0;
}

// Free the hashmap
void hashmap_free(HashMap *map) {
    for (int i = 0; i < TABLE_SIZE; i++) {
        PatientNode *current = map->table[i];
        while (current != NULL) {
            PatientNode *temp = current;
            current = current->next;
            free(temp);
        }
        map->table[i] = NULL;
    }
    map->size = 0;
}

// Load a patient from file into the hashmap
int load_patient_from_file(HashMap *map, long id) {
    const char *folder = "E:/Final-SDP-Project/backend/c/patient/all-patient-files";
    char filename[512];
    snprintf(filename, sizeof(filename), "%s/%ld.txt", folder, id);
    
    FILE *f = fopen(filename, "r");
    if (!f) {
        printf("Patient with ID %ld not found.\n", id);
        return 0;
    }
    
    Patient p;
    memset(&p, 0, sizeof(Patient));
    p.id = id;
    
    char line[256];
    
    while (fgets(line, sizeof(line), f)) {
        size_t len = strlen(line);
        if (len > 0 && line[len-1] == '\n') {
            line[len-1] = '\0';
        }
        
        if (strncmp(line, "Name: ", 6) == 0) {
            strncpy(p.name, line + 6, MAX_PATIENT_NAME - 1);
        } else if (strncmp(line, "Date of Birth: ", 15) == 0) {
            strncpy(p.dateOfBirth, line + 15, MAX_DATE_OF_BIRTH - 1);
        } else if (strncmp(line, "Weight: ", 8) == 0) {
            p.weight = atof(line + 8);
        } else if (strncmp(line, "Mobile Number: ", 15) == 0) {
            strncpy(p.mobileNumber, line + 15, MAX_PATIENT_MOBILE_NUMBER - 1);
        }
    }
    
    fclose(f);
    
    // Insert the patient into our hashmap
    hashmap_insert(map, &p);
    return 1;
}

// Get patient by ID, either from hashmap or load from file
int get_patient_by_id(HashMap *map, long id, Patient *p) {
    // First check if patient exists in hashmap
    if (hashmap_get(map, id, p)) {
        return 1;
    }
    
    // If not in hashmap, try to load from file
    if (load_patient_from_file(map, id)) {
        // Now it should be in the hashmap
        return hashmap_get(map, id, p);
    }
    
    return 0;
}

void print_patient(const Patient *p) {
    printf("FOUND|%ld|%s|%s|%.2f|%s\n",
           p->id, p->name, p->dateOfBirth, p->weight, p->mobileNumber);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <patient_id>\n", argv[0]);
        return 1;
    }
    
    long id = atol(argv[1]);
    
    // Initialize our hashmap
    HashMap patient_map;
    hashmap_init(&patient_map);
    
    Patient p;
    
    if (get_patient_by_id(&patient_map, id, &p)) {
        print_patient(&p);
        hashmap_free(&patient_map);
        return 0;
    } else {
        printf("ERROR|Patient with ID %ld could not be found.\n", id);
        hashmap_free(&patient_map);
        return 1;
    }
}