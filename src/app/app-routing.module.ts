import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuestionsComponent } from './questions/questions.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ask' },
  { path: 'ask', component: QuestionsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
