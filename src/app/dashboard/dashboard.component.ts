import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ NavbarComponent, RouterModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent {

}
