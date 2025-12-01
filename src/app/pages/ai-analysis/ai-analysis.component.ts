import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AiAnalysisService, AiAnalysisResponse } from '../../services/ai-analysis.service';

@Component({
  selector: 'app-ai-analysis',
  templateUrl: './ai-analysis.component.html',
  styleUrls: ['./ai-analysis.component.css']
})
export class AiAnalysisComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  result: AiAnalysisResponse | null = null;

  constructor(private fb: FormBuilder, private aiService: AiAnalysisService) {
    this.form = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  get text() { return this.form.get('text'); }

  analyze() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = null;
    this.result = null;
    
    this.aiService.analyzeText(this.text?.value).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error inesperado';
        this.loading = false;
      }
    });
  }

  getEmotionTag(emotion: string): { label: string, color: string, emoji: string } {
    switch (emotion) {
      case 'joy': return { label: 'Alegría', color: 'bg-yellow-100 text-yellow-800', emoji: '😊' };
      case 'sadness': return { label: 'Tristeza', color: 'bg-blue-100 text-blue-800', emoji: '😢' };
      case 'anger': return { label: 'Enojo', color: 'bg-red-100 text-red-800', emoji: '😠' };
      case 'fear': return { label: 'Miedo', color: 'bg-purple-100 text-purple-800', emoji: '😨' };
      case 'surprise': return { label: 'Sorpresa', color: 'bg-pink-100 text-pink-800', emoji: '😲' };
      case 'disgust': return { label: 'Disgusto', color: 'bg-green-100 text-green-800', emoji: '🤢' };
      case 'neutral': return { label: 'Neutral', color: 'bg-gray-100 text-gray-800', emoji: '😐' };
      default: return { label: emotion, color: 'bg-gray-200 text-gray-700', emoji: '❓' };
    }
  }

  getIntensityTag(intensity: string): { label: string, color: string } {
    switch (intensity) {
      case 'high': return { label: 'Alta', color: 'bg-red-200 text-red-800' };
      case 'medium': return { label: 'Media', color: 'bg-yellow-200 text-yellow-800' };
      case 'low': return { label: 'Baja', color: 'bg-green-200 text-green-800' };
      default: return { label: intensity, color: 'bg-gray-200 text-gray-700' };
    }
  }
} 