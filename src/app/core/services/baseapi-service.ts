import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseapiService {
  getApiBaseUrl():string{
    // return "https://ucelearning.azurewebsites.net";
    return "https://localhost:7032/api"
  }
}
