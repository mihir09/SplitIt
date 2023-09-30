import { Component } from '@angular/core';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  groups: any[] = [];

  constructor(private usersService: UsersService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUserGroups();
  }

  loadUserGroups() {
    this.usersService.getUserGroups(this.authService.getCurrentUser()!).subscribe(
      (groups) => {
        this.groups = groups;
      },
      (error) => {
        console.error('Error loading user groups:', error);
      }
    );
  }
}
