import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionsService, SessionDisplay } from '../../services/sessions.service';
import { TranscriptionService } from '../../services/transcription.service';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {
  sessions: SessionDisplay[] = [];
  filteredSessions: SessionDisplay[] = [];
  loading = true;
  error: string | null = null;
  showNewSessionModal = false;
  
  // Filtros
  searchTerm = '';
  dateFilter = '';
  statusFilter = '';
  hasTranscriptionFilter = false;
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Modal de confirmación de eliminación
  showDeleteModal = false;
  sessionToDelete: SessionDisplay | null = null;
  deletingSession = false;
  showSuccessMessage = false;

  // Modales de transcripción
  showAddTranscriptionModal = false;
  showViewTranscriptionModal = false;
  selectedSessionId: number = 0;

  // Modal de acciones
  showActionsModal = false;
  selectedSessionForActions: SessionDisplay | null = null;
  sessionTranscription: any = null;
  loadingTranscription = false;

  // Dropdown state (mantener para compatibilidad temporal)
  openDropdownId: number | null = null;

  // Modal de confirmación de eliminación de transcripción
  showDeleteTranscriptionModal = false;
  transcriptionToDelete: any = null;
  deletingTranscription = false;

  // Modal de detalle de paciente
  showPatientDetailModal = false;
  selectedPatient: any = null;

  constructor(
    private sessionsService: SessionsService,
    private transcriptionService: TranscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;
    
    this.sessionsService.getSessionsForDisplay().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las sesiones';
        this.loading = false;
        console.error('Error loading sessions:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.sessions];

    // Filtro por nombre de paciente
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(session =>
        session.patient?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por fecha
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.fecha);
        return sessionDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filtro por estado
    if (this.statusFilter) {
      if (this.statusFilter === 'pagado') {
        filtered = filtered.filter(session => session.pagado);
      } else if (this.statusFilter === 'pendiente') {
        filtered = filtered.filter(session => !session.pagado);
      }
    }

    // Filtro por transcripción
    if (this.hasTranscriptionFilter) {
      // Este filtro se aplicará después de verificar las transcripciones
      // Por ahora, lo aplicamos basándonos en si la sesión tiene transcripción
      // En una implementación real, necesitarías verificar esto con el backend
    }

    this.filteredSessions = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSessions.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  get paginatedSessions(): SessionDisplay[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredSessions.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onDateFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTranscriptionFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dateFilter = '';
    this.statusFilter = '';
    this.hasTranscriptionFilter = false;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getMaxDisplayed(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredSessions.length);
  }

  createNewSession(): void {
    this.router.navigate(['/crear-sesion']);
  }

  viewPatientDetails(patientId: number): void {
    this.router.navigate(['/pacientes', patientId]);
  }

  trackBySessionId(index: number, session: SessionDisplay): number {
    return session.id;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  getSessionDuration(session: SessionDisplay): string {
    const start = new Date(`2000-01-01T${session.horaInicio}`);
    const end = new Date(`2000-01-01T${session.horaFin}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) return '0 min';
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} h`;
    } else {
      return `${hours} h ${minutes} min`;
    }
  }

  getSessionTypeLabel(tipo: string): string {
    const tipos = {
      'individual': 'Individual',
      'grupal': 'Grupal',
      'familiar': 'Familiar',
      'evaluacion': 'Evaluación',
      'seguimiento': 'Seguimiento'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  }

  getPaymentStatusText(pagado: boolean): string {
    return pagado ? 'Pagado' : 'Pendiente';
  }

  getPaymentStatusColor(pagado: boolean): string {
    return pagado ? 'text-green-600' : 'text-orange-600';
  }

  get paidSessionsCount(): number {
    return this.sessions.filter(session => session.pagado).length;
  }

  get pendingSessionsCount(): number {
    return this.sessions.filter(session => !session.pagado).length;
  }

  get totalAmount(): number {
    const paidSessions = this.sessions.filter(session => session.pagado);
    const total = paidSessions.reduce((sum, session) => sum + (session.monto || 0), 0);
    
    console.log('=== DEBUG TOTAL RECAUDADO ===');
    console.log('Total de sesiones:', this.sessions.length);
    console.log('Sesiones pagadas:', paidSessions.length);
    console.log('Sesiones pagadas:', paidSessions.map(s => ({ id: s.id, monto: s.monto, pagado: s.pagado })));
    console.log('Total recaudado:', total);
    console.log('================================');
    
    return total;
  }

  get totalRevenue(): number {
    return this.sessions.reduce((total, session) => total + (session.monto || 0), 0);
  }

  // Métodos para el modal de acciones
  openActionsModal(session: SessionDisplay, event: Event): void {
    event.stopPropagation();
    this.selectedSessionForActions = session;
    this.showActionsModal = true;
    this.checkSessionTranscription(session.id);
  }

  closeActionsModal(): void {
    this.showActionsModal = false;
    this.selectedSessionForActions = null;
    this.sessionTranscription = null;
    this.loadingTranscription = false;
  }

  // Verificar si la sesión ya tiene transcripción
  checkSessionTranscription(sessionId: number): void {
    this.loadingTranscription = true;
    this.sessionTranscription = null;
    
    this.transcriptionService.getTranscriptionBySessionId(sessionId).subscribe({
      next: (transcription) => {
        this.sessionTranscription = transcription;
        this.loadingTranscription = false;
      },
      error: (err) => {
        // Si no se encuentra transcripción (404), es normal
        if (err.status === 404) {
          this.sessionTranscription = null;
        } else {
          console.error('Error al verificar transcripción:', err);
        }
        this.loadingTranscription = false;
      }
    });
  }

  // Verificar si la sesión tiene transcripción
  hasTranscription(): boolean {
    return this.sessionTranscription !== null;
  }

  // Métodos para el modal de acciones
  onViewPatient(): void {
    if (this.selectedSessionForActions && this.selectedSessionForActions.patient) {
      this.selectedPatient = this.selectedSessionForActions.patient;
      this.showPatientDetailModal = true;
      this.closeActionsModal();
    }
  }

  closePatientDetailModal(): void {
    this.showPatientDetailModal = false;
    this.selectedPatient = null;
  }

  onViewTranscription(): void {
    if (this.selectedSessionForActions) {
      this.openViewTranscriptionModal(this.selectedSessionForActions.id);
      this.closeActionsModal();
    }
  }

  onAddTranscription(): void {
    if (this.selectedSessionForActions) {
      this.openAddTranscriptionModal(this.selectedSessionForActions.id);
      this.closeActionsModal();
    }
  }

  onDeleteSession(): void {
    if (this.selectedSessionForActions) {
      this.openDeleteModal(this.selectedSessionForActions);
      this.closeActionsModal();
    }
  }

  // Métodos del dropdown (mantener para compatibilidad)
  toggleDropdown(sessionId: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === sessionId ? null : sessionId;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }

  shouldShowDropdownAbove(sessionId: number): boolean {
    // Lógica para mostrar dropdown arriba si no hay espacio abajo
    return false; // Implementar lógica real si es necesario
  }

  // Métodos para transcripciones
  openAddTranscriptionModal(sessionId: number): void {
    this.selectedSessionId = sessionId;
    this.showAddTranscriptionModal = true;
  }

  closeAddTranscriptionModal(): void {
    this.showAddTranscriptionModal = false;
    this.selectedSessionId = 0;
  }

  onTranscriptionCreated(): void {
    this.closeAddTranscriptionModal();
    this.loadSessions();
  }

  openViewTranscriptionModal(sessionId: number): void {
    this.selectedSessionId = sessionId;
    this.showViewTranscriptionModal = true;
  }

  closeViewTranscriptionModal(): void {
    this.showViewTranscriptionModal = false;
    this.selectedSessionId = 0;
  }

  openDeleteTranscriptionModal(transcription: any): void {
    this.transcriptionToDelete = transcription;
    this.showDeleteTranscriptionModal = true;
  }

  closeDeleteTranscriptionModal(): void {
    this.showDeleteTranscriptionModal = false;
    this.transcriptionToDelete = null;
  }

  confirmDeleteTranscription(): void {
    if (!this.transcriptionToDelete) return;

    this.deletingTranscription = true;
    this.transcriptionService.deleteTranscription(this.transcriptionToDelete.id).subscribe({
      next: () => {
        this.deletingTranscription = false;
        this.closeDeleteTranscriptionModal();
        this.closeViewTranscriptionModal();
        this.loadSessions();
        this.showSuccessNotification('Transcripción eliminada correctamente');
      },
      error: (err) => {
        this.deletingTranscription = false;
        console.error('Error deleting transcription:', err);
        this.showSuccessNotification('Error al eliminar la transcripción');
      }
    });
  }

  // Métodos para el modal de nueva sesión
  openNewSessionModal(): void {
    this.showNewSessionModal = true;
  }

  closeNewSessionModal(): void {
    this.showNewSessionModal = false;
  }

  onSessionCreated(): void {
    this.closeNewSessionModal();
    this.loadSessions();
  }

  // Métodos para eliminación de sesiones
  openDeleteModal(session: SessionDisplay): void {
    this.sessionToDelete = session;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.sessionToDelete = null;
  }

  confirmDeleteSession(): void {
    if (!this.sessionToDelete) return;

    this.deletingSession = true;
    this.sessionsService.deleteSession(this.sessionToDelete.id).subscribe({
      next: () => {
        this.deletingSession = false;
        this.closeDeleteModal();
        this.loadSessions();
        this.showSuccessNotification();
      },
      error: (err) => {
        this.deletingSession = false;
        console.error('Error deleting session:', err);
        this.showSuccessNotification('Error al eliminar la sesión');
      }
    });
  }

  showSuccessNotification(message: string = 'Sesión eliminada correctamente'): void {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  updateSessionStatus(session: SessionDisplay): void {
    this.sessionsService.updateSessionStatus(session.id, !session.pagado).subscribe({
      next: () => {
        session.pagado = !session.pagado;
        this.showSuccessNotification(session.pagado ? 'Sesión marcada como pagada' : 'Sesión marcada como pendiente');
      },
      error: (err) => {
        console.error('Error updating session status:', err);
        this.showSuccessNotification('Error al actualizar el estado de la sesión');
      }
    });
  }
} 