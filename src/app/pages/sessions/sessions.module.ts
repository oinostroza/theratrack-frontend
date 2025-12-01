import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SessionsComponent } from './sessions.component';
import { NewSessionComponent } from './new-session/new-session.component';
import { AddTranscriptionComponent } from './add-transcription/add-transcription.component';
import { ViewTranscriptionComponent } from './view-transcription/view-transcription.component';
import { PatientService } from '../../services/patient.service';
import { SessionsService } from '../../services/sessions.service';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: SessionsComponent }
];

@NgModule({
  declarations: [
    SessionsComponent,
    NewSessionComponent,
    AddTranscriptionComponent,
    ViewTranscriptionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: [
    PatientService,
    SessionsService
  ]
})
export class SessionsModule { } 