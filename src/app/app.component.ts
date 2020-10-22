import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services/authentication.service';
import { MockService } from './_services/mock.service';

import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentUser: User;
  isMockActivated: Boolean;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private mockSvc: MockService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.mockSvc.getMockStatus().subscribe(s => this.isMockActivated = s.active);
  }

  activate() {
    this.mockSvc.activateMock().subscribe(s => this.isMockActivated = s);
  }
  
  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
