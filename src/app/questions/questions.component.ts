import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { of } from 'rxjs';
import { RestApiService } from '../shared/rest-api.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  form: FormGroup;
  questionList: any = [];
  cocResult: string;
  checked = false;
  indeterminate = false;
  labelPosition = 'after';
  disabled = false;

  constructor(private formBuilder: FormBuilder, public restApi: RestApiService) {
    this.form = this.formBuilder.group({
      questions: new FormArray([], minSelectedCheckboxes(1))
    });
    this.cocResult = 'Undetermined';

    // async questions
    of(this.getQuestions()).subscribe(questions => {
      this.questionList = questions;
      this.addCheckboxes();
    });
  }

  ngOnInit() {
    // this.loadQuestions();
  }

  loadQuestions() {
    return this.restApi.getQuestions().subscribe((data: {}) => {
      this.questionList = data;
    });
  }

  private addCheckboxes() {
    this.questionList.forEach((o, i) => {
      const control = new FormControl();
      (this.form.controls.questions as FormArray).push(control);
    });
  }

  submit() {
    const selectedQuestionIds = this.form.value.questions
      .map((v, i) => v ? this.questionList[i] : null )
      .filter(v => v !== null);
    console.log(selectedQuestionIds);
    this.cocResult = 'Met / Not Met';
  }

  getQuestions() {
    return [
      { id: 100, quextext: 'Have these services been requested, approved, and rendered for this member in the past?', level: '1', quexid: 'A' },
      { id: 200, quextext: 'Did this members treatment did not previously require prior-authorization from BCBS Massachusetts or their prior insurance carrier, and benefits were received?', level: '1', quexid: 'B' },
      { id: 300, quextext: 'Have these services been requested, approved, and rendered for this member in the past?', level: '2', quexid: '1' },
      { id: 400, quextext: 'Reword this Changes to the member’s treatment, including  additions, removals, or changes in administration of the drugs included in the regimen are not being submitted on this request.', level: '2', quexid: '2' },
      { id: 500, quextext: 'The member could have reasonably relied on a previous approval to continue services and it will be detrimental to the member if continuation of the services is not approved', level: '2', quexid: '3' },
      { id: 600, quextext: 'Interruption of the services could potentially alter the progression of the condition or disease', level: '2', quexid: '4' },
      { id: 700, quextext: 'Continuation of the services will allow an appropriate transition of care', level: '2', quexid: '5' }
      ];
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
