import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SidebarComponent, NavbarComponent, RouterModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent {

}
