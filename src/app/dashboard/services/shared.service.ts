import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private messageSubject = new Subject<string>();

  sendMessage(message: string) {
    this.messageSubject.next(message);
  }

  getMessage() {
    return this.messageSubject.asObservable();
  }
}
