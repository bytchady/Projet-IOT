import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServices } from '../../../services/auth/auth.services';
import { ServerMessagesServices } from '../../../services/server-messages/server-messages.services';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { Router } from '@angular/router';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Footer, Header, NgClass],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthServices,
    private serverMessageService: ServerMessagesServices,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (res: any) => {
        this.serverMessageService.showMessage(res.message, res.error);

        if (!res.error) {
          this.authService.setToken(res.token);

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        }
      },
      error: (err) => {
        const message = err.error?.message || "Erreur serveur interne";
        this.serverMessageService.showMessage(message, true);
      }
    });
  }
}
