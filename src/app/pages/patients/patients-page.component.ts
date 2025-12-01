import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient, CreatePatientRequest } from '../../interfaces/patient.interface';

@Component({
  selector: 'app-patients-page',
  templateUrl: './patients-page.component.html',
  styleUrls: ['./patients-page.component.css']
})
export class PatientsPageComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  patientForm: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;
  success: string | null = null;
  showForm = false;
  showPatientDetailModal = false;
  selectedPatient: Patient | null = null;
  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      gender: ['', Validators.required],
      contactInfo: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;

    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = patients;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pacientes';
        this.loading = false;
        console.error('Error loading patients:', err);
      }
    });
  }

  filterPatients(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = this.patients;
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredPatients = this.patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchLower)
      );
    }
  }

  onSearchChange(): void {
    this.filterPatients();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterPatients();
  }

  onSubmit(): void {
    if (this.patientForm.invalid || this.submitting) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    const formData: CreatePatientRequest = this.patientForm.value;

    this.patientService.createPatient(formData).subscribe({
      next: (newPatient) => {
        this.submitting = false;
        this.success = `Paciente ${newPatient.fullName} creado exitosamente`;
        this.patientForm.reset();
        this.showForm = false;
        this.loadPatients();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.success = null;
        }, 5000);
      },
      error: (err) => {
        this.submitting = false;
        this.error = 'Error al crear el paciente. Inténtalo de nuevo.';
        console.error('Error creating patient:', err);
      }
    });
  }

  markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      const control = this.patientForm.get(key);
      control?.markAsTouched();
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.patientForm.reset();
      this.error = null;
    }
  }

  viewPatientDetails(patientId: number): void {
    this.selectedPatient = this.patients.find(p => p.id === patientId) || null;
    this.showPatientDetailModal = true;
    document.body.classList.add('modal-open');
  }

  closePatientDetailModal(): void {
    this.showPatientDetailModal = false;
    this.selectedPatient = null;
    document.body.classList.remove('modal-open');
  }

  getGenderLabel(gender: string): string {
    const genderLabels: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'other': 'Otro',
      'masculino': 'Masculino',
      'femenino': 'Femenino',
      'otro': 'Otro'
    };
    return genderLabels[gender.toLowerCase()] || gender;
  }

  getGenderColor(gender: string): string {
    const genderColors: { [key: string]: string } = {
      'male': 'text-blue-600',
      'female': 'text-pink-600',
      'other': 'text-purple-600',
      'masculino': 'text-blue-600',
      'femenino': 'text-pink-600',
      'otro': 'text-purple-600'
    };
    return genderColors[gender.toLowerCase()] || 'text-gray-600';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get f() {
    return this.patientForm.controls;
  }

  trackByPatientId(index: number, patient: Patient): number {
    return patient.id;
  }
} 