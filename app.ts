//Using object oriented approach
class ProjectInput {
  //My Fields
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;

  constructor() {
    //tell typscript that this element will never be null with !
    this.templateElement = document.querySelector(
      '#project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.querySelector('#app')! as HTMLDivElement;
  }
}
console.log('it works');
