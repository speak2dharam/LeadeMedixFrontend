import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showloader = false;
  loginform: FormGroup;
  errorMessage: string = "";

  private authService = inject(AuthService);
  constructor(private router: Router, private fb: FormBuilder) {
    this.loginform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }
  get formControls() {
    return this.loginform.controls;
  }

  login() {
    if (this.loginform.valid) {
      debugger
      this.showloader = true;
      this.authService.login(this.loginform.value).subscribe({
        next: (res) => {
          if (res.success) {
            console.log(res);
            this.router.navigate(['/users']);
          }
        },
        error: err => console.error(err)
      });
    }
    else {
      this.errorMessage = 'issue in login form';
      //console.log("issue in login form");
      this.showloader = false;
    }

  }

}
