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
  tCnt: number;

  constructor(private http: HttpClient) {
    this.tCnt = 0;
  }

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  async getQuestionsAsync() {
    this.asyncResult = await this.http.get<Question[]>(this.apiURL + '/api/coc/').toPromise();
    console.log('No issues, I will wait until promise is resolved..');
    console.log('Get Results - ' + this.asyncResult.length);
    return this.asyncResult;
  }

  async getQuestionsWithCriteriaAsync(dEntry: Date, dOS: Date, dPS: Date, mnFlag: boolean) {
    console.log('starting getQuestionsWithCriteriaAsync');
    console.log('url passed - ' + this.apiURL + '/api/coc' +
    '/' + dPS.toISOString() +
    '/' + dEntry.toISOString() +
    '/' + dOS.toISOString() +
    '/' + mnFlag);
    this.asyncResult = await this.http.get<Question[]>(this.apiURL + '/api/coc' +
    '/' + dPS.toISOString() +
    '/' + dEntry.toISOString() +
    '/' + dOS.toISOString() +
    '/' + mnFlag).pipe(catchError(this.handleError)).toPromise();
    console.log('No issues, I will wait until promise is resolved..');
    console.log('Get Results - ' + this.asyncResult.length);
    // console.log('tCnt - ' + this.tCnt);
    // this.asyncResult.splice(this.tCnt, 1);
    // this.tCnt++;
    // console.log('Splice Results - ' + this.asyncResult.length);
    return this.asyncResult;
  }

  getQuestionsWithCriteria(dEntry: Date, dOS: Date, dPS: Date, mnFlag: boolean) {
    console.log('starting getQuestionsWithCriteriaAsync');
    console.log('/' + dPS.toISOString());
    console.log('/' + dEntry.toISOString());
    console.log('/' + dOS.toISOString());

    console.log('url passed - ' + this.apiURL + '/api/coc' +
    '/' + dPS.toISOString() +
    '/' + dEntry.toISOString() +
    '/' + dOS.toISOString() +
    '/' + mnFlag);
    return this.http.get<Question[]>(this.apiURL + '/api/coc' +
    '/' + dPS.toISOString() +
    '/' + dEntry.toISOString() +
    '/' + dOS.toISOString() +
    '/' + mnFlag).pipe(catchError(this.handleError));
    // console.log('No issues, I will wait until promise is resolved..');
    // console.log('Get Results - ' + this.asyncResult.length);
    // console.log('tCnt - ' + this.tCnt);
    // this.asyncResult.splice(this.tCnt, 1);
    // this.tCnt++;
    // console.log('Splice Results - ' + this.asyncResult.length);
    // return this.asyncResult;
  }

  // getQuestionsObservable(): Observable<Question[]> {
  //   return this.http.get<Question[]>(this.apiURL + '/api/coc/')
  //   .pipe(
  //     retry(1),
  //     catchError(this.handleError)
  //   );
  // }

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
