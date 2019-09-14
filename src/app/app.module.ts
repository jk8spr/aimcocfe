import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCheckboxModule} from '@angular/material';
import {MatDatepickerModule, MatInputModule, MatNativeDateModule} from '@angular/material';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { QuestionsComponent } from './questions/questions.component';

@NgModule({
  declarations: [
    AppComponent,
    QuestionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDatepickerModule, MatInputModule, MatNativeDateModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
