import { Component } from './base-component';
import { Validatable, validate } from '../util/validation';
import { autobind } from '../decorators/autobind';
import { projectState } from '../state/project-state';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    //get access to different elements and store as properties
    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    //attaching the form to the DOM
    this.configure();
  }
  configure() {
    //configure the form. bind to preconfigured event
    this.element.addEventListener('submit', this.submitHandler);
  }
  renderContent() {}

  //PRIVATE METHODS
  //using private methods to keep it isolated to this class
  //using a TUPLE to limit the number of parameters and types
  //return a tuple...first element is the title, second is the description. third is the number of people
  //void means no return value
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 6,
    };

    //trimming the whitespace
    if (
      !validate(titleValidatable) &&
      !validate(descriptionValidatable) &&
      !validate(peopleValidatable)
    ) {
      alert('Please enter valid values');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }
  //clear the form of any data
  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  //@autobind decorator is used to bind the method to the class
  //Using so I dont have to manual bind the methods to the class
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    //getting the values from the form
    const userInput = this.gatherUserInput();
    //checking if user input is valid with array check since using tuple above
    if (Array.isArray(userInput)) {
      //destructuring the array
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}
