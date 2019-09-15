import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Question } from '../app/models/question';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  // Define API
  apiURL = 'https://cocapi.azurewebsites.net';
  asyncResult: Question[];

  constructor(private http: HttpClient) { }

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  async getQuestionsAsync() {
    this.asyncResult = await this.http.get<Question[]>(this.apiURL + '/api/coc/').toPromise();
    console.log('No issues, I will wait until promise is resolved..');
    return this.asyncResult;
  }

  getQuestionsObservable(): Observable<Question[]> {
    return this.http.get<Question[]>(this.apiURL + '/api/coc/')
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getQuestions() {
    return this.http.get<Question[]>(this.apiURL + '/api/coc/')
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
 }

}
