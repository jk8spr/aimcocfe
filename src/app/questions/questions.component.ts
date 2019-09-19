import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { RestApiService } from '../../services/rest-api.service';
import { Question } from '../models/question';
import { CocResult } from '../models/coCResult';
import { of } from 'rxjs';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  form: FormGroup;
  questionList: Question[];
  EvalResults: CocResult;
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
  levelClinical: string;

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
    this.EvalResults = { coCDetermination: '', levelOne: '', levelTwo: '', levelThree: '', badgeFlag: null, extra: ''};
    this.levelClinical = 'Not Met';
  }

  ngOnInit() {
    // this.loadQuestions();
    this.loadQuestionsWithCriteriaAsync();
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
        console.log('loadQuestionsWithCriteriaAsync Results - ' + questions.length);
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
        console.log('loadQuestionsWithCriteria Results - ' + questions.length);
      });
  }

  private addCheckboxes() {
    this.questionList.forEach((o, i) => {
      const control = new FormControl(i < 0);
      (this.form.controls.questions as FormArray).push(control);
    });
  }

  private unCheckAll() {
    this.form.controls.questions.setValue(
        this.form.controls.questions.value
            .map(value => false));
  }

  private resetCriteria() {
    console.log('in reset');
    this.unCheckAll();
    this.cocResult = null;
    this.badgeflag = false;
  }

  submit() {
    const selectedQuestionIds = this.form.value.questions
      .map((v, i) => v ? this.questionList[i] : null )
      .filter(v => v !== null);
    console.log(selectedQuestionIds);
    this.restApi.getCoCResultAsync(selectedQuestionIds).then(x => {
      this.EvalResults = x;
      this.EvalResults.levelOne = x.levelOne;
      if (x.levelTwo === 'Met' && x.levelThree === 'Met') {
        this.levelClinical = 'Met';
      } else {
        this.levelClinical = 'Not Met'; }
      console.log('coc jk Results - ' + JSON.stringify(x));
      console.log(x.levelOne);
      console.log(x.levelTwo);
      console.log(x.levelThree);
      console.log(x.coCDetermination);
      console.log(x.badgeFlag);

      this.cocResult = this.EvalResults.levelOne + ' / ' +
                       this.levelClinical + ' / ' +
                       this.EvalResults.coCDetermination;
      this.badgeflag = this.EvalResults.badgeFlag;
      console.log('done with submit');
      // this.unCheckAll();
    });
  }

  CheckAndReload(): void {
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;
    console.log('dateEntry - ' + this.dateEntry.toDateString());
    console.log('dateOS - ' + this.dateOS.toDateString());
    console.log('datePrgStart - ' + this.datePrgStart.toDateString());
    const datePrgStartPlus180 = addDays(this.datePrgStart, 180);
    console.log('datePrgStartPlus180 - ' + datePrgStartPlus180.toDateString());
    console.log('HARD STOP LOGIC');
    console.log(this.dateEntry > datePrgStartPlus180 && this.dateOS < this.datePrgStart);
    console.log(this.dateEntry.toDateString() + ' > ' + datePrgStartPlus180.toDateString() +
            ' && ' + this.dateOS.toDateString() + ' < ' + this.datePrgStart.toDateString());
    if (this.dateEntry > datePrgStartPlus180 &&
        this.dateOS < this.datePrgStart) {
        this.cocResult = 'HARD STOP';
    } else {
        this.questionList = [];
        this.loadQuestionsWithCriteriaAsync();
        this.resetCriteria();
    }
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

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}
