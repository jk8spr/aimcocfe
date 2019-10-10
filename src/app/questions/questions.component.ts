import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { RestApiService } from '../../services/rest-api.service';
import { Question } from '../models/question';
import { CocResult } from '../models/coCResult';
import { ILevelOne } from '../models/levelZero';
import { ITreatment } from '../models/treatment';
import { MatSelectionListChange, MatRadioChange  } from '@angular/material';
import { MatCheckbox } from '@angular/material';

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
  vanillaFlag = true;
  bool = new FormControl(false);
  cocResult: string;
  checked = false;
  indeterminate = false;
  labelPosition = 'after';
  disabled = false;
  badgeflag: boolean;
  levelClinical: string;
  readyflag: boolean;
  finishflag: boolean;
  tt: number;
  levelZeroList: ILevelOne[] = [
    // {id: 0, quexText: 'New Treatment \n',
    //  extra: 'Patient is receiving this treatment for the first time.  This includes additions to, removals, or changes in administration of the drugs from a previous treatment Plan.'},
    {id: 1, quexText: 'Treatment Extension \n', extra: 'This treatment has been previously reviewed by AIM'},
    {id: 2, quexText: 'Continuation of Treatment \n',
     extra: 'These services have been approved by the health Plan or previously did not required authorization'}
  ];
  selectedValue: string;
  treatmentType: ILevelOne;
  newTreatment: boolean;
  yesNoAnswers: string[] = ['Yes', 'No'];
  treatments: ITreatment[] = [
    {id: 1, quexText: 'Treatment Extension \n', extra: 'This treatment has been previously reviewed by AIM'},
    {id: 2, quexText: 'Continuation of Treatment \n',
     extra: 'These services have been approved by the health Plan or previously did not required authorization'}
  ];

  constructor(
    private formBuilder: FormBuilder,
    public restApi: RestApiService) {
    this.form = this.formBuilder.group({
      questions: new FormArray([], minSelectedCheckboxes(0)),
      dateEntry: new FormControl(new Date('7/10/2021')), // new FormControl(null),
      dateOS: new FormControl(new Date('7/11/2021')), // new FormControl(null),
      datePrgStart: new FormControl(new Date('1/1/2021')),
      vanillaFlag: true,
      badgeflag: false,
      newTreatment: null,
      treatmentType: new FormControl(null),
    });
  }

  ngOnInit() {
    this.badgeflag = false;
    this.readyflag = false;
    this.finishflag = false;
    this.EvalResults = { coCDetermination: '', levelOne: '', levelTwo: '', levelThree: '', badgeFlag: null, extra: ''};
    this.levelClinical = 'Not Met';
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;

    if (this.dateEntry &&
      this.dateOS &&
      this.datePrgStart) {
      this.readyflag = true;
    }
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


  loadLevelOneList() {
    this.restApi.getLevelOne();
  }

  loadQuestionsAsync() {
    this.restApi.getQuestionsAsync().then(questions => {
        this.questionList = questions;
        this.addCheckboxes();
        // console.log(JSON.stringify(questions));
        console.log('loadQuestions Results - ' + questions.length);
      });
  }

  loadQuestionsWithCriteriaAsync() {
    console.log('in loadQuestionsWithCriteriaAsync');
    if (this.readyflag) {
      this.dateEntry = this.form.value.dateEntry;
      this.dateOS = this.form.value.dateOS;
      this.datePrgStart = this.form.value.datePrgStart;
      this.vanillaFlag = this.form.value.vanillaFlag;
      this.treatmentType = this.form.value.treatmentType;
      if (this.finishflag) {
        this.tt = 0;
        if (this.newTreatment === false) {
          this.tt = this.treatmentType.id;
        }
        console.log('passing this to getQs -> tt value = ' + this.tt.toString());
        this.restApi.getQuestionsWithCriteriaAsync(
        this.dateEntry,
        this.dateOS,
        this.datePrgStart,
        this.vanillaFlag,
        this.tt).then(questions => {
          this.questionList = questions ? questions : [];
          this.addCheckboxes();
          if (questions) {
            console.log(JSON.stringify(questions));
            console.log('loadQuestionsWithCriteriaAsync Results - ' + questions.length);
          }
        });
      } else {
        console.log('NOT tt');
      }
    }
  }

  loadQuestionsWithCriteria() {
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;
    this.vanillaFlag = this.form.value.vanillaFlag;
    this.restApi.getQuestionsWithCriteria(this.dateEntry,
      this.dateOS,
      this.datePrgStart,
      this.vanillaFlag).subscribe(questions => {
        this.questionList = questions;
        this.addCheckboxes();
        // console.log(JSON.stringify(questions));
        console.log('loadQuestionsWithCriteria Results - ' + questions.length);
      });
  }

  private addCheckboxes() {
    if (this.questionList) {
      this.questionList.forEach((o, i) => {
        const control = new FormControl(i < 0);
        (this.form.controls.questions as FormArray).push(control);
      });
    }
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
    // this.vanillaFlag = true;
  }

  submit() {
    console.log('In submit - treatmentType');
    console.log(this.form.value.treatmentType);
    const selectedQuestionIds = this.form.value.questions
      .map((v, i) => v ? this.questionList[i] : null )
      .filter(v => v !== null);
    console.log(selectedQuestionIds);
    this.tt = 0;
    this.treatmentType = this.form.value.treatmentType;
    if (this.newTreatment === false) {
      this.tt = this.treatmentType.id;
    }
    this.restApi.getCoCResultAsync(selectedQuestionIds, this.tt).then(x => {
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
      this.cocResult = this.EvalResults.coCDetermination;
      this.badgeflag = this.EvalResults.badgeFlag;
      console.log('done with submit');
      // this.unCheckAll();
    });
  }

  CheckAndReload(): void {
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;
    this.vanillaFlag = this.form.value.vanillaFlag;
    const datePrgStartPlus180 = addDays(this.datePrgStart, 180);
    console.log('dateEntry - ' + this.dateEntry.toDateString());
    console.log('dateOS - ' + this.dateOS.toDateString());
    console.log('datePrgStart - ' + this.datePrgStart.toDateString());
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

  public onDate(newDate): void {
    console.log('in onDate - ' + newDate);
    this.readyflag = false;
    this.dateEntry = this.form.value.dateEntry;
    this.dateOS = this.form.value.dateOS;
    this.datePrgStart = this.form.value.datePrgStart;
    if (this.dateEntry &&
        this.dateOS &&
        this.datePrgStart) {
        this.readyflag = true;
    } else {
      this.resetCriteria();
      this.questionList = null;
    }
  }

  onTreatmentTypeChange(event: MatSelectionListChange) {
    console.log('in onTreatmentTypeChange');
    console.log('selectedOptions:', event.source._value);
    if (event.source._value) {
      this.treatmentType = this.form.value.treatmentType;
      this.selectedValue = this.treatmentType.extra;
      console.log('selectedValue' + this.selectedValue);
      this.readyflag = true;
      this.finishflag = true;
      this.loadQuestionsWithCriteriaAsync();
    } else {
      this.finishflag = false;
      this.selectedValue = '';
      this.questionList = [];
    }
    this.resetCriteria();
  }

  showFinishButton()  {
    // (!questionList || questionList.length < 1) || (treatmentType && treatmentType.id == 0)
    return true;
  }

  onCBClick(checkbox: MatCheckbox) {
      console.log('In ');
      console.log(checkbox);
      // console.log(checkbox.checked);
      this.vanillaFlag = !checkbox;
  }

  radioChange($event: MatRadioChange) {
    console.log('in radioChange');
    console.log($event.source.name, $event.value);
    this.resetCriteria();
    if ($event.value === 'Yes') {
      this.newTreatment = true;
      this.finishflag = true;
      this.form.controls.treatmentType.reset();
      this.selectedValue = '';
    } else {
      this.newTreatment = false;
      this.finishflag = false;
      this.CheckAndReload();
    }
    // this.CheckAndReload();
    console.log('newTreatment flag = ' + this.newTreatment);
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
