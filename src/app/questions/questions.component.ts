import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { RestApiService } from '../../services/rest-api.service';
import { Question } from '../models/question';
import { of } from 'rxjs';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  form: FormGroup;
  questionList: Question[];
  // date = new FormControl(new Date());
  dateEntry = new Date();
  dateOS = new Date();
  datePrgStart = new Date();
  mnFlag = false;
  bool = new FormControl(false);
  cocResult: string;
  checked = false;
  indeterminate = false;
  labelPosition = 'after';
  disabled = false;
  badgeflag: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public restApi: RestApiService) {
    this.form = this.formBuilder.group({
      questions: new FormArray([], minSelectedCheckboxes(0)),
      dateOS: new FormControl(new Date('7/11/2021')),
      dateEntry: new FormControl(new Date('7/10/2021')),
      datePrgStart: new FormControl(new Date('1/1/2021')),
      badgeflag: false
    });
    this.badgeflag = false;
  }

  ngOnInit() {
    // this.loadQuestions();
    this.loadQuestionsAsync();
  }

  // loadQuestions() {
  //   return this.restApi.getQuestions().subscribe(questions => {
  //     this.questionList = questions;
  //     this.addCheckboxes();
  //     // console.log(JSON.stringify(questions));
  //   },
  //     error => { this.questionList = []; }
  //   );
  // }

  loadQuestionsAsync() {
    this.restApi.getQuestionsAsync().then(questions => {
        this.questionList = questions;
        this.addCheckboxes();
        // console.log(JSON.stringify(questions));
        console.log('loadQuestions Results - ' + questions.length);
      });
  }

  loadQuestionsWithCriteriaAsync() {
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;
    this.restApi.getQuestionsWithCriteriaAsync(this.dateEntry,
      this.dateOS,
      this.datePrgStart,
      this.mnFlag).then(questions => {
        this.questionList = questions;
        this.addCheckboxes();
        // console.log(JSON.stringify(questions));
        console.log('loadQuestions Results - ' + questions.length);
      });
  }

  loadQuestionsWithCriteria() {
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;
    this.restApi.getQuestionsWithCriteria(this.dateEntry,
      this.dateOS,
      this.datePrgStart,
      this.mnFlag).subscribe(questions => {
        this.questionList = questions;
        this.addCheckboxes();
        // console.log(JSON.stringify(questions));
        console.log('loadQuestions Results - ' + questions.length);
      });
  }

  private addCheckboxes() {
    this.questionList.forEach((o, i) => {
      const control = new FormControl();
      (this.form.controls.questions as FormArray).push(control);
    });
  }

  private resetCheckboxes() {
    this.form = this.formBuilder.group({
      questions: new FormArray([], minSelectedCheckboxes(0)),
      dateOS: new FormControl(new Date('7/11/2021')),
      dateEntry: new FormControl(new Date('7/10/2021')),
      datePrgStart: new FormControl(new Date('1/1/2021')),
      badgeflag: false
    });
  }

  submit() {
    const selectedQuestionIds = this.form.value.questions
      .map((v, i) => v ? this.questionList[i] : null )
      .filter(v => v !== null);
    console.log(selectedQuestionIds);
    this.cocResult = 'Met / Admin';
    this.badgeflag = true;
  }

  CheckAndReload(): void {
    console.log('dateEntry.value - ' + this.dateEntry);
    this.questionList = [];
    this.loadQuestionsWithCriteria();
    this.resetCheckboxes();
  }

}

function minSelectedCheckboxes(min = 1) {
  const validator: ValidatorFn = (formArray: FormArray) => {
    const totalSelected = formArray.controls
      .map(control => control.value)
      .reduce((prev, next) => next ? prev + next : prev, 0);

    return totalSelected >= min ? null : { required: true };
  };

  return validator;
}
