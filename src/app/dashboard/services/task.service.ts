import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  // doc,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  // setDoc,
  SnapshotOptions,
} from '@angular/fire/firestore';
import { Task } from '../interfaces/task.interface';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private taskConverter: FirestoreDataConverter<Task> = {
    toFirestore(task: Task): DocumentData {
      return { ...task };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions,
    ): Task {
      const data = snapshot.data(options)!;
      return {
        id: snapshot.id,
        email: data['email'] || [],
        contacts: data['contacts'] || [],
        text: data['text'] || [],
        tags: data['tags'] || [],
        links: data['links'] || [],
      };
    },
  };

  private taskCollection;

  constructor(private firestore: Firestore) {
    // Inicializa la colección con el convertidor
    this.taskCollection = collection(this.firestore, 'tasks').withConverter(
      this.taskConverter,
    );
  }

  createTask(task: Task): Observable<Task> {
    return from(addDoc(this.taskCollection, task));
  }

  getTasks(): Observable<Task[]> {
    return collectionData(this.taskCollection, { idField: 'id' }) as Observable<
      Task[]
    >;
  }

  // updateTask(task: Task): Observable<void> {
  //   const taskDocRef = doc(this.taskCollection, task.id);
  //   return from(setDoc(taskDocRef, task));
  // }
}
