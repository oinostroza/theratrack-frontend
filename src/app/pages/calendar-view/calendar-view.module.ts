import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarViewComponent } from './calendar-view.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CalendarViewComponent],
  imports: [CommonModule, FormsModule],
  exports: [CalendarViewComponent]
})
export class CalendarViewModule {} 