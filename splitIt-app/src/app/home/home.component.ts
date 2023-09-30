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

  constructor(private usersService: UsersService, private authService: AuthService) {
    this.loadUserGroups();
  }

  ngOnInit(): void {
  }

  loadUserGroups() {
    this.usersService.getUserGroups(this.authService.getCurrentUser()!).subscribe({
      next : (groups) => {
        this.groups = groups;
      },
      error: (error) => {
        console.error('Error loading user groups:', error.error.message);
      }
    });
  }
}
