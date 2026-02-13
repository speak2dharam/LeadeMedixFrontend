import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);

  email = '';
  password = '';

  login() {
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => console.log('Logged in'),
      error: err => console.error(err)
    });
  }

}
