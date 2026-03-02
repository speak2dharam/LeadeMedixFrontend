import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authSrv = inject(AuthService);
  ngOnInit(): void {
    console.log(this.authSrv.getUser())
    console.log(this.authSrv.getUserId())
    console.log(this.authSrv.getUserEmail())
    console.log(this.authSrv.getUserRoles())
    console.log(this.authSrv.getUserName())
  }
}
