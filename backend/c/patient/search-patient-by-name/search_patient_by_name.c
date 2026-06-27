#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <ctype.h>
#include "../patient.h"

#define MAX_PATIENTS 100

typedef struct {
    long id;
    char name[MAX_PATIENT_NAME];
    char dateOfBirth[MAX_DATE_OF_BIRTH];
    double weight;
    char mobileNumber[MAX_PATIENT_MOBILE_NUMBER];
} PatientSearchResult;


typedef struct BSTNode {
    PatientSearchResult patient;
    struct BSTNode *left;
    struct BSTNode *right;
    struct BSTNode *next; 
    
} BSTNode;

void to_lowercase(char* str) {
    for (int i = 0; str[i]; i++) {
        str[i] = tolower(str[i]);
    }
}

BSTNode* create_node(PatientSearchResult patient) {
    BSTNode* new_node = (BSTNode*)malloc(sizeof(BSTNode));
    if (new_node == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }
    new_node->patient = patient;
    new_node->left = NULL;
    new_node->right = NULL;
    new_node->next = NULL;
    return new_node;
}

BSTNode* insert_node(BSTNode* root, PatientSearchResult patient) {
    if (root == NULL) {
        return create_node(patient);
    }
    
    if (patient.id < root->patient.id) {
        root->left = insert_node(root->left, patient);
    } else if (patient.id > root->patient.id) {
        root->right = insert_node(root->right, patient);
    }
    else {
        root->patient = patient;
    }
    
    return root;
}

BSTNode* bst_to_linked_list(BSTNode* root, BSTNode** head, BSTNode** tail) {
    if (root == NULL) {
        return NULL;
    }
    
    bst_to_linked_list(root->left, head, tail);
    
    if (*head == NULL) {
        *head = root;
    } else {
        (*tail)->next = root;
    }
    

    *tail = root;

    bst_to_linked_list(root->right, head, tail);
    
    return *head;
}

void collect_results_inorder(BSTNode* root, PatientSearchResult results[], int* count) {
    if (root == NULL || *count >= MAX_PATIENTS) {
        return;
    }
    
    collect_results_inorder(root->left, results, count);
    
    if (*count < MAX_PATIENTS) {
        results[*count] = root->patient;
        (*count)++;
    }
    
    collect_results_inorder(root->right, results, count);
}

void free_bst(BSTNode* root) {
    if (root == NULL) {
        return;
    }
    
    free_bst(root->left);
    free_bst(root->right);
    free(root);
}

void free_linked_list(BSTNode* head) {
    BSTNode* current = head;
    BSTNode* next = NULL;
    
    while (current != NULL) {
        next = current->next;
        free(current);
        current = next;
    }
}

int load_all_patients(PatientSearchResult results[], int max_count, const char* search_name) {
    const char *folder = "E:/Final-SDP-Project/backend/c/patient/all-patient-files";
    BSTNode* root = NULL;
    BSTNode* list_head = NULL;
    BSTNode* list_tail = NULL;
    int matching_count = 0; 
    
    DIR *dir;
    struct dirent *entry;
    
    dir = opendir(folder);
    if (!dir) {
        perror("Could not open patient directory");
        return 0;
    }
    
    char lowercase_search[MAX_PATIENT_NAME];
    strncpy(lowercase_search, search_name, MAX_PATIENT_NAME - 1);
    lowercase_search[MAX_PATIENT_NAME - 1] = '\0';
    to_lowercase(lowercase_search);
    
    while ((entry = readdir(dir)) != NULL) {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
            continue;
        }
        
        char *dot = strrchr(entry->d_name, '.');
        if (!dot || strcmp(dot, ".txt") != 0) {
            continue;
        }
        
        char filepath[512];
        snprintf(filepath, sizeof(filepath), "%s/%s", folder, entry->d_name);
        
        FILE *patient_file = fopen(filepath, "r");
        if (!patient_file) {
            continue;
        }
        
        Patient temp_patient = {0};
        int found_name = 0;
        
        char line[256];
        while (fgets(line, sizeof(line), patient_file)) {
            size_t len = strlen(line);
            if (len > 0 && line[len-1] == '\n') {
                line[len-1] = '\0';
                len--;
            }
            
            if (strncmp(line, "ID: ", 4) == 0) {
                temp_patient.id = atol(line + 4);
            } else if (strncmp(line, "Name: ", 6) == 0) {
                strncpy(temp_patient.name, line + 6, MAX_PATIENT_NAME - 1);
                
                char lowercase_name[MAX_PATIENT_NAME];
                strncpy(lowercase_name, temp_patient.name, MAX_PATIENT_NAME - 1);
                lowercase_name[MAX_PATIENT_NAME - 1] = '\0';
                to_lowercase(lowercase_name);
                
                if (strlen(lowercase_search) == 0 || strstr(lowercase_name, lowercase_search) != NULL) {
                    found_name = 1;
                }
            } else if (strncmp(line, "Date of Birth: ", 15) == 0) {
                strncpy(temp_patient.dateOfBirth, line + 15, MAX_DATE_OF_BIRTH - 1);
            } else if (strncmp(line, "Weight: ", 8) == 0) {
                temp_patient.weight = atof(line + 8);
            } else if (strncmp(line, "Mobile Number: ", 15) == 0) {
                strncpy(temp_patient.mobileNumber, line + 15, MAX_PATIENT_MOBILE_NUMBER - 1);
            }
        }
        
        fclose(patient_file);
        
        if (found_name) {
            PatientSearchResult result = {
                .id = temp_patient.id,
                .weight = temp_patient.weight
            };
            strncpy(result.name, temp_patient.name, MAX_PATIENT_NAME - 1);
            strncpy(result.dateOfBirth, temp_patient.dateOfBirth, MAX_DATE_OF_BIRTH - 1);
            strncpy(result.mobileNumber, temp_patient.mobileNumber, MAX_PATIENT_MOBILE_NUMBER - 1);
            
            root = insert_node(root, result);
            matching_count++;
        }
    }
    
    closedir(dir);
    
    if (root != NULL) {
        bst_to_linked_list(root, &list_head, &list_tail);
        
        BSTNode* current = list_head;
        int i = 0;
        while (current != NULL && i < max_count) {
            results[i++] = current->patient;
            current = current->next;
        }
        

    }
    

    free_bst(root);
    
    return matching_count > max_count ? max_count : matching_count;
}

void print_patient_search_results(const PatientSearchResult results[], int count) {
    printf("SEARCH_RESULTS_START\n");
    for (int i = 0; i < count; i++) {
        printf("%ld|%s|%s|%.2f|%s\n",
               results[i].id, 
               results[i].name, 
               results[i].dateOfBirth, 
               results[i].weight, 
               results[i].mobileNumber);
    }
    printf("SEARCH_RESULTS_END\n");
}

int main(int argc, char *argv[]) {
    const char *search_term = "";
    if (argc > 1) {
        search_term = argv[1];
    }
    
    PatientSearchResult results[MAX_PATIENTS];
    int count = load_all_patients(results, MAX_PATIENTS, search_term);
    
    print_patient_search_results(results, count);
    
    return 0;
}