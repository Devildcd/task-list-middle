import { Component, HostListener, OnInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export default class TasksComponent implements OnInit {
  showInput: boolean = false;
  isSmallScreen!: boolean;

  ngOnInit() {
    this.isSmallScreen = window.innerWidth < 1230;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.showInput &&
      !target.closest('.card') &&
      !target.closest('.add-task-container')
    ) {
      this.showInput = false; // Oculta el formulario si el clic fue afuera
    }
  }

  toggleInput(): void {
    this.showInput = !this.showInput;
  }

  cancel() {
    this.showInput = false;
  }
}
