//custom type enum
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//Project State Maanagement Class

//custom type Listener

type Listener = (items: Project[]) => void;
class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
    for (const listenerFn of this.listeners) {
      //making copy of the array
      listenerFn(this.projects.slice());
    }
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
  }
}

//global instance
const projectState = ProjectState.getInstance();

//Validation Interface with optional chaining
// validation rules for a user
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
//checking all properties in Validatable Interface exist and if so do the validation
function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    //if true - trim and check the length
    //if number, convert to string
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//Instead of bind, will use an autobind decorator
//decorator is function that is called on a class
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor = {
    configurable: true,
    get: function () {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  //adjusted descriptor is returned
  return adjDescriptor;
}

//ProjectList Class to work with 'project list template HTML'
class ProjectList {
  //My Fields
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement; // for the section element
  assignedProjects: Project[];
  constructor(private type: 'active' | 'finished') {
    //telling typscript that this element will never be null with !
    this.templateElement = document.querySelector(
      '#project-list'
      //using casting to HTMLTemplateElement
    )! as HTMLTemplateElement;
    this.hostElement = document.querySelector('#app') as HTMLDivElement;
    this.assignedProjects = [];

    //render the form
    //giving reference to the template element
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    //active and innactive project lists
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl?.appendChild(listItem);
    }
  }

  // ! to rule out null case
  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      //'active | finished'
      this.type.toUpperCase() + ' PROJECTS';
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

//ProjectInput Classs to work with 'project input template HTML'
class ProjectInput {
  //My Fields
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.querySelector(
      '#project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.querySelector('#app')! as HTMLDivElement;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';
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
    this.attach();
  }
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

  private configure() {
    //configure the form. bind to preconfigured event
    this.element.addEventListener('submit', this.submitHandler);
  }

  //reaching out to the DOM
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}
//recompiling the app.ts here and run it.
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
