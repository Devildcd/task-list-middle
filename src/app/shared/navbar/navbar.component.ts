import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from '../../dashboard/services/shared.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private messageSubscription: Subscription | undefined;
  public message: string | null = '';

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.messageSubscription = this.sharedService
      .getMessage()
      .subscribe((msg: string) => {
        this.message = msg;
      });
  }

  ngOnDestroy() {
    this.messageSubscription!.unsubscribe();
  }

  closeAlert() {
    this.message = null; // Limpia el mensaje para cerrar la alerta
  }
}
