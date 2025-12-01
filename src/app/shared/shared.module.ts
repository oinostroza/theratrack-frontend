import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetailComponent } from '../pages/patients/patient-detail.component';

@NgModule({
  declarations: [
    PatientDetailComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PatientDetailComponent
  ]
})
export class SharedModule { } 