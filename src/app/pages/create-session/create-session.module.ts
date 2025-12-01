import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateSessionComponent } from './create-session.component';

const routes: Routes = [
  { path: '', component: CreateSessionComponent }
];

@NgModule({
  declarations: [
    CreateSessionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CreateSessionModule { } 