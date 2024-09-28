import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../interfaces/task.interface';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export default class TasksComponent implements OnInit {
  showInput: boolean = false;
  isSmallScreen: boolean = false;
  tasks: Task[] = [];
  taskForm!: FormGroup;
  items: string[] = [];
  placeholder: string = 'Type to add new task';
  isDisabled: boolean = true;
  errorMessage: string = '';
  loading = true;

  @ViewChild('inputField', { static: false })
  inputField!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    public taskService: TaskService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.isSmallScreen = window.innerWidth < 1230;
    this.taskForm = this.fb.group({
      input: ['', Validators.required],
    });

    this.onResize(null);
    this.loadTasks();
  }

  // funcionalidades para interactuar con el formulario y los chips
  onChipBarClick(): void {
    this.inputField.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent, value: string): void {
    switch (event.key) {
      case 'Enter':
      case ',': {
        if (value && value.trim() !== '') {
          if (!this.items.includes(value)) {
            this.items = [...this.items, value.trim()];
          }
          this.inputField.nativeElement.value = '';
          event.preventDefault();
        }
        break;
      }
      case 'Backspace': {
        if (!value && this.items.length > 0) {
          this.items.pop();
        }
        break;
      }
      default:
        break;
    }
  }

  onChipBarKeyup(event: KeyboardEvent) {
    // Verifica si se presionó Enter o la barra espaciadora
    if (event.key === 'Enter' || event.key === ' ') {
      this.onChipBarClick();
      event.preventDefault();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(index: number, item: string): number {
    return index;
  }

  // Método para determinar el texto del botón
  get buttonText(): string {
    return this.taskForm.get('input')?.value ? 'Add' : 'Ok';
  }

  // funcionalidades para guardar, cargar y aplicar estilos a los chips en el formulario
  loadTasks(): void {
    this.taskService.getTasks().subscribe(
      (tasks: Task[]) => {
        this.tasks = tasks;
        this.loading = false;
        this.cd.markForCheck();
      },
      (error) => {
        console.error('Error loading tasks:', error);
      },
    );
  }

  getItemClass(item: string, type: string): string {
    if (type === 'email') {
      return 'orange-chip';
    } else if (type === 'tag') {
      return 'violet-chip';
    } else if (type === 'link') {
      return 'blue-chip';
    } else if (type === 'contact') {
      return 'green-chip';
    }
    return 'item-default';
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const task: Task = {
        email: [],
        contacts: [],
        text: [],
        tags: [],
        links: [],
      };
      this.items.forEach((item: string) => {
        if (this.isEmail(item)) {
          task.email!.push(item);
        } else if (this.isTag(item)) {
          task.tags!.push(item);
        } else if (this.isLink(item)) {
          task.links!.push(item);
        } else if (this.isContact(item)) {
          task.contacts!.push(item);
        } else {
          task.text!.push(item);
        }
      });
      if (
        task.email!.length > 0 ||
        task.contacts!.length > 0 ||
        task.text!.length > 0 ||
        task.tags!.length > 0 ||
        task.links!.length > 0
      ) {
        this.taskService.createTask(task).subscribe({
          next: () => {
            console.log('Task created successfully');
            this.loadTasks();
            this.taskForm.reset();
            this.showInput = false;
            this.items = [];
            console.log(task);
          },
          error: (error) => {
            console.error('Error creating task', error);
          },
        });
      } else {
        this.errorMessage = 'type and press enter to create the tag';
        setTimeout(() => {
          this.errorMessage = '';
        }, 2000);
      }
    } else {
      this.showInput = false;
    }
  }

  // funcionalidades para evaluar y aplicar estilos segun el chip
  isLink(item: string): boolean {
    try {
      const url = new URL(item);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  isEmail(item: string): boolean {
    return this.isValidFormat(item) && this.startsWithLowerCase(item);
  }

  isValidFormat(email: string): boolean {
    // Expresión regular para validar el formato del correo electrónico
    const emailPattern = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailPattern.test(email);
  }

  isTag(item: string): boolean {
    return item.includes('#');
  }

  isContact(item: string): boolean {
    return (
      this.startsWithUpperCase(item) &&
      !this.isEmail(item) &&
      !this.isLink(item) &&
      !this.isTag(item)
    );
  }

  isPlainText(item: string): boolean {
    return (
      !this.isEmail(item) &&
      !this.isLink(item) &&
      !this.isTag(item) &&
      !this.isContact(item)
    );
  }

  startsWithLowerCase(item: string): boolean {
    return item.charAt(0) === item.charAt(0).toLowerCase();
  }

  startsWithUpperCase(item: string): boolean {
    // Función para verificar si la cadena comienza con una letra mayúscula
    return item.charAt(0) === item.charAt(0).toUpperCase();
  }

  openLink(item: string) {
    if (this.isEmail(item)) {
      window.open('_blank');
    } else if (this.isLink(item)) {
      window.open(item, '_blank');
    } else if (this.isContact(item)) {
      window.open(item, '_blank');
    } else if (this.isTag(item)) {
      window.open(item, '_blank');
    } else {
      console.log('Etiqueta no válida');
    }
  }

  // Funcionalidades con click
  // Detectar el evento al hacer click afuera
  @HostListener('document:click', ['$event'])
  onClick(event?: MouseEvent) {
    const target = event!.target as HTMLElement;
    if (
      this.showInput &&
      !target.closest('.first-container') &&
      !target.closest('.second-container') &&
      !target.closest('.add-task-container')
    ) {
      this.showInput = false;
    }
  }

  // Controlar la resolucion de la pantalla
  @HostListener('window:resize', ['$event'])
  onResize(event: Event | null) {
    const width = window.innerWidth;
    this.isSmallScreen = width < 1230;
  }

  // Controlar la creacion de tareas
  toggleInput(): void {
    this.showInput = !this.showInput;
  }

  cancel() {
    this.showInput = false;
  }
}
