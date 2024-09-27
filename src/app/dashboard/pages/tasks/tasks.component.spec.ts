import { ComponentFixture, TestBed } from '@angular/core/testing';

import TasksComponent from './tasks.component';
import { TaskService } from '../../services/task.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreMock } from '../../../testing/firestore.mock';
import { of, throwError } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'createTask',
    ]);
    
    // Simulando que getTasks devuelve un observable con tareas ficticias
    taskServiceSpy.getTasks.and.returnValue(
      of([
      {
        id: '1',
        text: ['Test Task 1'],
        email: [],
        tags: [],
        links: [],
        contacts: [],
      },
      {
        id: '2',
        text: ['Test Task 2'],
        email: [],
        tags: [],
        links: [],
        contacts: [],
      },
    ]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TasksComponent],
      providers: [
        FormBuilder,
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Firestore, useClass: FirestoreMock },
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    // Mock del inputField
    const mockInputField = document.createElement('input');
    component.inputField = new ElementRef(mockInputField);
  });

  it('should create the component and initialize values correctly', () => {
    // Act
    component.ngOnInit();

    // Assert
    expect(component).toBeTruthy(); // Verifica que el componente se haya creado correctamente
    expect(component.isSmallScreen).toBe(window.innerWidth < 1230); // Verifica la condición de isSmallScreen

    expect(component.taskForm).toBeDefined(); 
    expect(component.taskForm.get('input')).toBeDefined(); 
    expect(component.taskForm.get('input')?.valid).toBeFalse(); // El campo input debería ser inválido al principio

    const loadTasksSpy = spyOn(component, 'loadTasks').and.callThrough(); // Espía la función loadTasks
    component.ngOnInit(); // Vuelve a llamarlo para verificar que se llame correctamente
    expect(loadTasksSpy).toHaveBeenCalled(); // Verifica que se haya llamado a loadTasks
  });

  it('should load tasks on init', () => {
    component.ngOnInit(); 
    expect(taskService.getTasks).toHaveBeenCalled(); 
    expect(component.tasks.length).toBe(2); // Verifica que las tareas se carguen correctamente
  });

  it('should focus input field on chip bar click', () => {
    const inputFieldSpy = spyOn(component.inputField.nativeElement, 'focus');
    component.onChipBarClick();
    expect(inputFieldSpy).toHaveBeenCalled();
  });

  it('should add item on Enter or comma key down', () => {
    const value = 'New Item';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(event as KeyboardEvent, value);
    expect(component.items).toContain(value);
  });

  it('should remove last item on Backspace key down', () => {
    component.items = ['Item 1', 'Item 2'];
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    component.onKeyDown(event as KeyboardEvent, '');
    expect(component.items.length).toBe(1);
    expect(component.items).toContain('Item 1');
  });

  it('should call onChipBarClick on Enter or space key up', () => {
    const chipBarClickSpy = spyOn(component, 'onChipBarClick');
    const eventEnter = new KeyboardEvent('keyup', { key: 'Enter' });
    const eventSpace = new KeyboardEvent('keyup', { key: ' ' });
    component.onChipBarKeyup(eventEnter as KeyboardEvent);
    expect(chipBarClickSpy).toHaveBeenCalled();
    component.onChipBarKeyup(eventSpace as KeyboardEvent);
    expect(chipBarClickSpy).toHaveBeenCalledTimes(2);
  });

  it('should return correct class for email type', () => {
    const result = component.getItemClass('test@example.com', 'email');
    expect(result).toBe('orange-chip');
  });
  
  it('should return correct class for tag type', () => {
    const result = component.getItemClass('tag1', 'tag');
    expect(result).toBe('violet-chip');
  });
  it('should return correct class for link type', () => {
    const result = component.getItemClass('http://example.com', 'link');
    expect(result).toBe('blue-chip');
  });
  it('should return correct class for contact type', () => {
    const result = component.getItemClass('John Doe', 'contact');
    expect(result).toBe('green-chip');
  });
  it('should return default class for unknown type', () => {
    const result = component.getItemClass('some item', 'unknown');
    expect(result).toBe('item-default');
  });

  // test OnSubmit
  describe('onSubmit', () => {
    beforeEach(() => {
      // Configura los valores de prueba
      component.items = [
        'test@example.com',
        'exampleTag',
        'http://example.com',
      ];
      component.taskForm.get('input')?.setValue('Some input'); // Simula que el input tiene un valor
    });

    it('should call createTask when form is valid', () => {
      // Usar el espía ya definido en el beforeEach, no es necesario crear createTaskSpy
      taskService.createTask.and.returnValue(of({})); // Simula que createTask devuelve un observable
      component.taskForm.setErrors(null); // Asegúrate de que el formulario es válido

      component.onSubmit();

      expect(taskService.createTask).toHaveBeenCalled(); // Verifica que createTask fue llamado
      expect(component.showInput).toBeFalse();
      expect(component.items).toEqual([]); // Verifica que items se haya vaciado
    });

    it('should not call createTask when form is invalid', () => {
      component.taskForm.setErrors({ required: true }); // Simula que el formulario es inválido

      component.onSubmit();

      expect(taskService.createTask).not.toHaveBeenCalled(); // Verifica que createTask no fue llamado
      expect(component.showInput).toBeFalse(); // Asegúrate de que showInput sea false
    });

    it('should log error when createTask fails', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      component.taskForm.setErrors(null); // Asegúrate de que el formulario es válido

      // Simula un error en la creación de la tarea
      taskService.createTask.and.returnValue(
        throwError(() => new Error('Error')),
      );

      component.onSubmit();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating task',
        jasmine.any(Error),
      );
    });

    it('should log message when no items to create task', () => {
      const consoleLogSpy = spyOn(console, 'log');
      component.items = []; // Simula que no hay items

      component.onSubmit();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'No se puede crear la tarea. El array de items está vacío.'
      );
    });
  });


  describe('isLink', () => {
    it('should return true for a valid HTTP link', () => {
      expect(component.isLink('http://example.com')).toBeTrue();
    });

    it('should return true for a valid HTTPS link', () => {
      expect(component.isLink('https://example.com')).toBeTrue();
    });

    it('should return false for an invalid link', () => {
      expect(component.isLink('invalid-link')).toBeFalse();
    });
  });

  describe('isEmail', () => {
    it('should return true for a valid email', () => {
      expect(component.isEmail('test@example.com')).toBeTrue();
    });

    it('should return false for an invalid email', () => {
      expect(component.isEmail('InvalidEmail')).toBeFalse();
    });
  });

  describe('isValidFormat', () => {
    it('should return true for a valid email format', () => {
      expect(component.isValidFormat('test@example.com')).toBeTrue();
    });

    it('should return false for an invalid email format', () => {
      expect(component.isValidFormat('Test@Example')).toBeFalse();
    });
  });

  describe('isTag', () => {
    it('should return true for a string that contains a tag (#)', () => {
      expect(component.isTag('#myTag')).toBeTrue();
    });

    it('should return false for a string without a tag', () => {
      expect(component.isTag('noTag')).toBeFalse();
    });
  });

  describe('isContact', () => {
    it('should return true for a valid contact format', () => {
      expect(component.isContact('ContactName')).toBeTrue();
    });

    it('should return false for an invalid contact format', () => {
      expect(component.isContact('test@example.com')).toBeFalse();
      expect(component.isContact('http://example.com')).toBeFalse();
      expect(component.isContact('#myTag')).toBeFalse();
    });
  });

  describe('isPlainText', () => {
    it('should return true for plain text', () => {
      expect(component.isPlainText('Just some text')).toBeTrue();
    });

    it('should return false for an email', () => {
      expect(component.isPlainText('test@example.com')).toBeFalse();
    });

    it('should return false for a link', () => {
      expect(component.isPlainText('http://example.com')).toBeFalse();
    });

    it('should return false for a tag', () => {
      expect(component.isPlainText('#myTag')).toBeFalse();
    });

    it('should return false for a contact', () => {
      expect(component.isPlainText('ContactName')).toBeFalse();
    });
  });

  describe('startsWithLowerCase', () => {
    it('should return true if the string starts with a lowercase letter', () => {
      expect(component.startsWithLowerCase('lowercase')).toBeTrue();
    });

    it('should return false if the string starts with an uppercase letter', () => {
      expect(component.startsWithLowerCase('Uppercase')).toBeFalse();
    });
  });

  describe('startsWithUpperCase', () => {
    it('should return true if the string starts with an uppercase letter', () => {
      expect(component.startsWithUpperCase('Uppercase')).toBeTrue();
    });

    it('should return false if the string starts with a lowercase letter', () => {
      expect(component.startsWithUpperCase('lowercase')).toBeFalse();
    });
  });

  describe('openLink', () => {
    it('should call window.open with the email for a valid email', () => {
      const windowOpenSpy = spyOn(window, 'open');
      component.openLink('test@example.com');
      expect(windowOpenSpy).toHaveBeenCalledWith('_blank');
    });

    it('should call window.open with the link for a valid link', () => {
      const windowOpenSpy = spyOn(window, 'open');
      component.openLink('http://example.com');
      expect(windowOpenSpy).toHaveBeenCalledWith('http://example.com', '_blank');
    });

    it('should log "Etiqueta no válida" for an invalid item', () => {
      const consoleLogSpy = spyOn(console, 'log');
      component.openLink('invalidItem');
      expect(consoleLogSpy).toHaveBeenCalledWith('Etiqueta no válida');
    });
  });

  describe('onClick', () => {
    it('should set showInput to false if clicking outside specified containers', () => {
      component.showInput = true;

      const mockEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
  
      const target = document.createElement('div');
      target.classList.add('not-in-container');
  
      Object.defineProperty(mockEvent, 'target', { value: target });
  
      component.onClick(mockEvent);
  
      expect(component.showInput).toBeFalse();
    });
  
    it('should not change showInput if clicking inside specified containers', () => {
      component.showInput = true;
  
      // Crear un evento de clic simulado
      const mockEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
  
      // Crear un elemento que simule el objetivo del evento
      const target = document.createElement('div');
      target.classList.add('first-container'); // Simulando un clic dentro de la contenedor
  
      // Llamar a onClick con el evento y el objetivo simulado
      Object.defineProperty(mockEvent, 'target', { value: target });
  
      component.onClick(mockEvent); // Llama a onClick con el evento
  
      expect(component.showInput).toBeTrue(); // showInput debería seguir siendo verdadero
    });
  });

  describe('onResize', () => {
    it('should set isSmallScreen to true when width is less than 1230', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200); // Simula un ancho menor a 1230

      component.onResize(null); // Llama a onResize

      expect(component.isSmallScreen).toBeTrue(); // Verifica que isSmallScreen sea verdadero
    });

    it('should set isSmallScreen to false when width is 1230 or more', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1230); // Simula un ancho de 1230

      component.onResize(null); // Llama a onResize

      expect(component.isSmallScreen).toBeFalse(); // Verifica que isSmallScreen sea falso
    });
  });

  describe('toggleInput', () => {
    it('should toggle showInput from false to true', () => {
      component.showInput = false; 

      component.toggleInput(); 

      expect(component.showInput).toBeTrue(); 
    });

    it('should toggle showInput from true to false', () => {
      component.showInput = true; 

      component.toggleInput(); 

      expect(component.showInput).toBeFalse(); 
    });
  });

  describe('cancel', () => {
    it('should set showInput to false', () => {
      component.showInput = true; 

      component.cancel(); 

      expect(component.showInput).toBeFalse(); 
    });
  });
});
