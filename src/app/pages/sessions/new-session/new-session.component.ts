import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionsService } from '../../../services/sessions.service';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../interfaces/patient.interface';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css']
})
export class NewSessionComponent implements OnInit {
  @Output() sessionCreated = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  sessionForm: FormGroup;
  loading = false;
  showPreview = false;
  error: string | null = null;
  patients: Patient[] = [];

  sessionTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'grupal', label: 'Grupal' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'evaluacion', label: 'Evaluación' },
    { value: 'seguimiento', label: 'Seguimiento' }
  ];

  constructor(
    private fb: FormBuilder,
    private sessionsService: SessionsService,
    private patientService: PatientService
  ) {
    this.sessionForm = this.fb.group({
      patientId: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      notas: [''],
      tipoSesion: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(1)]],
      pagado: [false]
    }, { validators: this.timeValidator });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
      }
    });
  }

  timeValidator(group: FormGroup) {
    const startTime = group.get('horaInicio')?.value;
    const endTime = group.get('horaFin')?.value;
    
    if (startTime && endTime && startTime >= endTime) {
      return { invalidTime: true };
    }
    return null;
  }

  get f() {
    return this.sessionForm.controls;
  }

  getTimeError(): string {
    if (this.sessionForm.errors?.['invalidTime']) {
      return 'La hora de inicio debe ser anterior a la hora de término';
    }
    return '';
  }

  getFormValidationErrors(): string[] {
    const errors: string[] = [];
    Object.keys(this.sessionForm.controls).forEach(key => {
      const control = this.sessionForm.get(key);
      if (control?.errors) {
        console.log(`Error en campo ${key}:`, control.errors);
        if (control.errors['required']) {
          errors.push(`El campo ${key} es obligatorio`);
        }
        if (control.errors['min']) {
          errors.push(`El campo ${key} debe ser mayor a ${control.errors['min'].min}`);
        }
      }
    });
    return errors;
  }

  showSessionPreview(): void {
    if (this.sessionForm.valid) {
      this.showPreview = true;
    } else {
      this.markFormGroupTouched();
    }
  }

  hidePreview(): void {
    this.showPreview = false;
  }

  markFormGroupTouched() {
    Object.keys(this.sessionForm.controls).forEach(key => {
      const control = this.sessionForm.get(key);
      control?.markAsTouched();
    });
  }

  onSubmit(): void {
    if (this.sessionForm.invalid || this.loading) {
      this.markFormGroupTouched();
      const validationErrors = this.getFormValidationErrors();
      if (validationErrors.length > 0) {
        this.error = `Errores de validación: ${validationErrors.join(', ')}`;
      }
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.sessionForm.value;
    
    // Convertir campos a los tipos correctos
    formData.patientId = Number(formData.patientId);
    formData.monto = Number(formData.monto);
    
    console.log('=== TIPOS DE DATOS ===');
    console.log('patientId tipo:', typeof formData.patientId, 'valor:', formData.patientId);
    console.log('monto tipo:', typeof formData.monto, 'valor:', formData.monto);
    console.log('fecha tipo:', typeof formData.fecha, 'valor:', formData.fecha);
    console.log('horaInicio tipo:', typeof formData.horaInicio, 'valor:', formData.horaInicio);
    console.log('horaFin tipo:', typeof formData.horaFin, 'valor:', formData.horaFin);
    console.log('tipoSesion tipo:', typeof formData.tipoSesion, 'valor:', formData.tipoSesion);
    console.log('notas tipo:', typeof formData.notas, 'valor:', formData.notas);
    console.log('pagado tipo:', typeof formData.pagado, 'valor:', formData.pagado);
    console.log('=====================');
    
    console.log('Formulario válido:', this.sessionForm.valid);
    console.log('Datos del formulario:', formData);
    console.log('Errores del formulario:', this.sessionForm.errors);
    
    this.sessionsService.createSession(formData).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa del servidor:', response);
        this.loading = false;
        this.sessionCreated.emit();
        this.closeModal.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error completo:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        this.loading = false;
        
        // Mostrar error más específico
        if (err.error && err.error.message) {
          this.error = `Error: ${err.error.message}`;
        } else if (err.status === 400) {
          this.error = 'Datos inválidos. Verifica la información ingresada.';
        } else if (err.status === 404) {
          this.error = 'Paciente no encontrado.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = `Error al crear la sesión (${err.status}). Inténtalo de nuevo.`;
        }
      }
    });
  }

  resetForm(): void {
    this.sessionForm.reset({
      patientId: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      notas: '',
      tipoSesion: '',
      monto: '',
      pagado: false
    });
    this.showPreview = false;
    this.error = null;
    console.log('Formulario reseteado');
  }

  onCancel(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  }

  getEmotionLabel(value: string): string {
    return this.sessionTypes.find(e => e.value === value)?.label || value;
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? patient.fullName : 'Paciente no seleccionado';
  }
} 