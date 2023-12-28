import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  _user: string | void = '';
  _userDetails: any;

  constructor(public authService: AuthService, public usersService: UsersService) {
    this._user = this.authService.getCurrentUser()

    if(!this._user){
      this.authService.logout()
    }
    this.usersService.getUserDetailsByEmail(this._user!).subscribe({
      next: (res) => {
        this._userDetails = res;
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
    
  }

  onLogout() {
    this.authService.logout();
  }
}