import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { Task } from '../dashboard/interfaces/task.interface';

@Injectable({
    providedIn: 'root',
})
export class FirestoreMock {
    collection(collectionName: string) {
        return {
            valueChanges: () =>
                of([
                    {
                        id: '1',
                        text: ['Test Task 1'], // Cambiado a un array
                        email: [],
                        tags: [],
                        links: [],
                        contacts: [],
                    },
                    {
                        id: '2',
                        text: ['Test Task 2'], // Cambiado a un array
                        email: [],
                        tags: [],
                        links: [],
                        contacts: [],
                    },
                ]),
            add: (data: Task) => Promise.resolve({ id: '123', ...data }),
            doc: (id: string) => ({
                set: (data: Task) => Promise.resolve({ id, ...data }),
                delete: () => Promise.resolve(),
                valueChanges: () =>
                    of({
                        id,
                        text: ['Test Task'], // Cambiado a un array
                        email: [],
                        tags: [],
                        links: [],
                        contacts: [],
                    }),
            }),
        };
    }
}