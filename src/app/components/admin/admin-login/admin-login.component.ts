import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { SmartflowService } from '../../../services/smartflow.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styles: [`
    @keyframes fadeUpCard {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    :host input:-webkit-autofill,
    :host input:-webkit-autofill:hover, 
    :host input:-webkit-autofill:focus, 
    :host input:-webkit-autofill:active {
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: #ffffff !important;
      transition: background-color 5000s ease-in-out 0s !important;
      box-shadow: inset 0 0 40px 40px rgba(15, 23, 42, 0.9) !important;
    }
    :host input {
      background-color: transparent !important;
    }
  `]
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  @Output() loginSuccess = new EventEmitter<void>();

  loginEmail = '';
  loginPassword = '';
  loginLoading = false;
  loginError = '';

  isSignUpMode = false;
  regName = '';
  regEmoji = '🧑‍💻';
  regPassword = '';
  regConfirm = '';
  regError = '';
  regSuccess = '';

  backgroundImages = [
    '/assets/images/quaderno-bg-left-logo.jpg'
  ];
  currentBgIndex = 0;
  private bgInterval: any;

  constructor(
    private adminService: AdminService,
    public smartflow: SmartflowService
  ) {}

  ngOnInit() {
    this.startBackgroundRotation();
  }

  ngOnDestroy() {
    this.stopBackgroundRotation();
  }

  startBackgroundRotation() {
    this.bgInterval = setInterval(() => {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.backgroundImages.length;
    }, 6000);
  }

  stopBackgroundRotation() {
    if (this.bgInterval) {
      clearInterval(this.bgInterval);
      this.bgInterval = null;
    }
  }

  loginAdmin() {
    this.loginError = '';
    
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Inserisci email e password';
      return;
    }
    
    if (this.loginEmail === 'admin') {
      // Normal admin service login (Master Admin)
      this.loginLoading = true;
      this.adminService.login(this.loginEmail, this.loginPassword).subscribe({
        next: () => {
          this.loginLoading = false;
          this.loginSuccess.emit();
        },
        error: (err) => {
          this.loginLoading = false;
          this.loginError = err.error?.error || 'Credenziali non valide o errore di rete';
        }
      });
    } else {
      // Smartflow Operator login
      const op = this.smartflow.operators.find(o => o.name === this.loginEmail && o.password === this.loginPassword);
      if (!op) {
        this.loginError = 'Credenziali errate';
        return;
      }
      if (op.status === 'pending') {
        this.loginError = 'Account in attesa di approvazione admin';
        return;
      }
      if (op.status === 'rejected') {
        this.loginError = 'Account respinto';
        return;
      }

      // Approved
      this.smartflow.loginAs(op.id);
      this.loginSuccess.emit();
    }
  }

  signUp() {
    this.regError = '';
    this.regSuccess = '';

    if (!this.regName || !this.regPassword || this.regPassword !== this.regConfirm) {
      this.regError = 'Campi non validi o le password non coincidono';
      return;
    }
    if (this.smartflow.operators.find(o => o.name === this.regName)) {
      this.regError = 'Nome già in uso';
      return;
    }

    this.smartflow.registerOperator(this.regName, this.regEmoji, this.regPassword);
    this.regSuccess = 'Registrazione completata! Attendi approvazione.';
    setTimeout(() => {
      this.isSignUpMode = false;
      this.regSuccess = '';
    }, 3000);
  }

  exitAdmin() {
    // Dovremmo emettere un evento per chiudere il route admin, 
    // ma dato che useremo l'AdminLayout, la logica sarà spostata in app.component o window.location
    window.location.hash = ''; // Hack semplice per togliere l'ancora /admin se usata
    // Ma meglio delegare. Per ora facciamo un location.reload() o simle.
    window.location.href = '/';
  }
}
