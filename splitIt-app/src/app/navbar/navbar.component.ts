import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  _userDetails: any = null;
  mobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    public usersService: UsersService,
    ) {}

  ngOnInit(): void {
    this.authService.currentUserEmail$.subscribe((email) => {
      if (email) {
        this.usersService.getUserDetailsByEmail(email).subscribe({
          next: (res) => {
            this._userDetails = res;
          },
          error: (err) => {
            console.error('Error fetching user details:', err);
            this._userDetails = null;
          }
        });
      } else {
        this._userDetails = null;
      }
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  onLogout() {
    this.authService.logout();
    this.mobileMenuOpen = false;
  }
}