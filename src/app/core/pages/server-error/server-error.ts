import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  templateUrl: './server-error.html',
  styleUrl: './server-error.css',
})
export class ServerError {
  reloadPage(): void {
    window.location.reload();
  }
}
