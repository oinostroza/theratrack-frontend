import { Component, OnInit } from '@angular/core';
import { SessionsService, SessionDisplay } from '../../services/sessions.service';
import { TranscriptionService, Transcription } from '../../services/transcription.service';

interface CalendarDay {
  date: Date;
  day: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  sessionCount: number;
  sessions: SessionDisplayWithTranscription[];
}

interface SessionDisplayWithTranscription extends SessionDisplay {
  transcription?: Transcription | null;
}

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  currentDate = new Date();
  weeks: CalendarDay[][] = [];
  sessionsByDate: { [date: string]: SessionDisplay[] } = {};
  loading = false;
  error: string | null = null;

  // Modal
  showDayModal = false;
  selectedDay: CalendarDay | null = null;
  loadingTranscriptions = false;

  years: number[] = [];
  selectedYear: number = new Date().getFullYear();

  constructor(
    private sessionsService: SessionsService,
    private transcriptionService: TranscriptionService
  ) {}

  ngOnInit(): void {
    this.initYears();
    this.selectedYear = this.currentDate.getFullYear();
    this.loadSessionsForMonth();
  }

  initYears(): void {
    const current = new Date().getFullYear();
    for (let y = 2020; y <= current + 1; y++) {
      this.years.push(y);
    }
  }

  onYearChange(): void {
    this.currentDate = new Date(this.selectedYear, this.currentDate.getMonth(), 1);
    this.loadSessionsForMonth();
  }

  prevMonth(): void {
    let month = this.currentDate.getMonth() - 1;
    let year = this.selectedYear;
    if (month < 0) {
      month = 11;
      year--;
    }
    this.selectedYear = year;
    this.currentDate = new Date(year, month, 1);
    this.loadSessionsForMonth();
  }

  nextMonth(): void {
    let month = this.currentDate.getMonth() + 1;
    let year = this.selectedYear;
    if (month > 11) {
      month = 0;
      year++;
    }
    this.selectedYear = year;
    this.currentDate = new Date(year, month, 1);
    this.loadSessionsForMonth();
  }

  get monthLabel(): string {
    return this.currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  }

  loadSessionsForMonth(): void {
    this.loading = true;
    this.error = null;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Obtener todas las sesiones del mes actual
    this.sessionsService.getSessionsForDisplay().subscribe({
      next: (sessions) => {
        this.sessionsByDate = {};
        sessions.forEach(session => {
          const dateStr = session.fecha;
          if (!this.sessionsByDate[dateStr]) {
            this.sessionsByDate[dateStr] = [];
          }
          this.sessionsByDate[dateStr].push(session);
        });
        this.generateCalendar();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las sesiones';
        this.loading = false;
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    const daysInMonth = lastDayOfMonth.getDate();
    const days: CalendarDay[] = [];

    // Días del mes anterior para completar la primera semana
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push(this.createCalendarDay(date, false));
    }
    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push(this.createCalendarDay(date, true));
    }
    // Días del mes siguiente para completar la última semana
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(date, false));
    }
    // Agrupar en semanas
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const dateStr = date.toISOString().slice(0, 10);
    const sessions = this.sessionsByDate[dateStr] || [];
    return {
      date,
      day: date.getDate(),
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
      isCurrentMonth,
      sessionCount: sessions.length,
      sessions,
    };
  }

  openDayModal(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    // Clonar el día y limpiar transcripciones
    const sessionsWithTrans: SessionDisplayWithTranscription[] = day.sessions.map(s => ({ ...s, transcription: undefined }));
    this.selectedDay = { ...day, sessions: sessionsWithTrans };
    this.showDayModal = true;
    document.body.classList.add('modal-open');
    this.loadTranscriptionsForSessions();
  }

  closeDayModal(): void {
    this.showDayModal = false;
    this.selectedDay = null;
    document.body.classList.remove('modal-open');
  }

  loadTranscriptionsForSessions(): void {
    if (!this.selectedDay) return;
    this.loadingTranscriptions = true;
    const sessionIds = this.selectedDay.sessions.map(s => s.id);
    let loaded = 0;
    for (const session of this.selectedDay.sessions) {
      this.transcriptionService.getTranscriptionBySessionId(session.id).subscribe({
        next: (transcription) => {
          session.transcription = transcription;
          loaded++;
          if (loaded === sessionIds.length) this.loadingTranscriptions = false;
        },
        error: (err) => {
          session.transcription = null;
          loaded++;
          if (loaded === sessionIds.length) this.loadingTranscriptions = false;
        }
      });
    }
  }
} 