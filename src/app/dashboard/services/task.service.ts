import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  // doc,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  QueryDocumentSnapshot,
  // setDoc,
  SnapshotOptions,
} from '@angular/fire/firestore';
import { Task, TaskItem } from '../interfaces/task.interface';
import { from, map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private taskConverter: FirestoreDataConverter<Task> = {
    toFirestore(task: Task): DocumentData {
      return {
        items: task.items.map((item) => ({
          type: item.type,
          value: item.value,
        })),
      };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions,
    ): Task {
      const data = snapshot.data(options)!;
      return {
        id: snapshot.id,
        items: data['items']
          ? data['items'].map((item: TaskItem) => ({
              type: item.type,
              value: item.value,
            }))
          : [],
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
    return from(addDoc(this.taskCollection, task)).pipe(
      switchMap((docRef: DocumentReference<Task>) =>
        from(getDoc(docRef)).pipe(
          map((docSnap) => {
            const data = docSnap.data();
            return { id: docSnap.id, ...data } as Task;
          }),
        ),
      ),
    );
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
