import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { NavbarComponent } from './app/components/navbar/navbar.component';
import { CartSidebarComponent } from './app/components/cart-sidebar/cart-sidebar.component';
import { AuthModalComponent } from './app/components/auth-modal/auth-modal.component';
import { ToastComponent } from './app/components/toast/toast.component';
import { client } from './lib/appwrite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartSidebarComponent, AuthModalComponent, ToastComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-cart-sidebar></app-cart-sidebar>
    <app-auth-modal></app-auth-modal>
    <app-toast></app-toast>
  `,
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
  ],
}).then(() => {
  client.ping()
    .then(() => console.log('Appwrite connection verified successfully'))
    .catch((err:any) => console.error('Failed to verify Appwrite connection:', err));
});
