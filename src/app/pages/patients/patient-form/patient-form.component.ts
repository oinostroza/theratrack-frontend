import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientsService } from '../../../services/patients.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent {
  @Output() patientCreated = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  patientForm: FormGroup;
  loading = false;
  error: string | null = null;

  genders = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private patientsService: PatientsService
  ) {
    this.patientForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      gender: ['', Validators.required],
      contactInfo: [''],
      notes: ['']
    });
  }

  get f() {
    return this.patientForm.controls;
  }

  markFormGroupTouched() {
    Object.keys(this.patientForm.controls).forEach(key => {
      const control = this.patientForm.get(key);
      control?.markAsTouched();
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid || this.loading) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.patientForm.value;
    
    this.patientsService.createPatient(formData).subscribe({
      next: () => {
        this.loading = false;
        this.patientCreated.emit();
        this.closeModal.emit();
        this.resetForm();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al crear el paciente. Inténtalo de nuevo.';
        console.error('Error creating patient:', err);
      }
    });
  }

  resetForm(): void {
    this.patientForm.reset();
    this.error = null;
  }

  onCancel(): void {
    this.closeModal.emit();
    this.resetForm();
  }
} 