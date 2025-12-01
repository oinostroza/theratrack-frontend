import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranscriptionService } from '../../../services/transcription.service';

@Component({
  selector: 'app-add-transcription',
  templateUrl: './add-transcription.component.html',
  styleUrls: ['./add-transcription.component.css']
})
export class AddTranscriptionComponent {
  @Input() sessionId: number = 0;
  @Output() transcriptionCreated = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  transcriptionForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private transcriptionService: TranscriptionService
  ) {
    this.transcriptionForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get f() {
    return this.transcriptionForm.controls;
  }

  onSubmit(): void {
    if (this.transcriptionForm.invalid || this.loading) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.transcriptionForm.value;
    
    console.log('Enviando transcripción:', { sessionId: this.sessionId, content: formData.content });
    
    this.transcriptionService.createTranscription({
      sessionId: this.sessionId,
      content: formData.content
    }).subscribe({
      next: (response) => {
        console.log('Transcripción creada exitosamente:', response);
        this.loading = false;
        this.transcriptionCreated.emit();
        this.closeModal.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al crear transcripción:', err);
        this.loading = false;
        
        if (err.error && err.error.message) {
          this.error = `Error: ${err.error.message}`;
        } else if (err.status === 400) {
          this.error = 'Datos inválidos. Verifica la información ingresada.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = `Error al crear la transcripción (${err.status}). Inténtalo de nuevo.`;
        }
      }
    });
  }

  markFormGroupTouched() {
    Object.keys(this.transcriptionForm.controls).forEach(key => {
      const control = this.transcriptionForm.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    this.transcriptionForm.reset();
    this.error = null;
  }

  onCancel(): void {
    this.closeModal.emit();
    this.resetForm();
  }
} 