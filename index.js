class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false
    };

    this.todos.push(todo);

    // this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);

    // this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo => 
      todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo
    );

    // this.onTodoListChanged(this.todos);
    this._commit(this.todos);
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  _commit(todos) {
    this.onTodoListChanged(todos);
    localStorage.setItem('todos', JSON.stringify(todos));
  }
}

class View {
  constructor() {
    this.app = this.getElement('#app');

    this.title = this.createElement('h1');
    this.title.textContent = 'Todos';

    this.form = this.createElement('form');

    this.input = this.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'ADD TODO';
    this.input.name = 'todo';

    this.submitButton = this.createElement('button');
    this.submitButton.textContent = 'Submit!';

    this.todoList = this.createElement('ul', 'todo-list');
    this.form.append(this.input, this.submitButton);

    this.app.append(this.title, this.form, this.todoList);
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if(className) {
      element.classList.add(className);
    }

    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  get _todoText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = '';
  }

  displayTodos(todos) {
    // debugger;
    while(this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    if(todos.length === 0) {
      const p = this.createElement('p');
      p.textContent = 'Empty Todo!!';
      this.todoList.append(p);
    } else {
      todos.forEach(todo => {
        const li = this.createElement('li');
        li.id = todo.id;

        const checkbox = this.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.complete;

        const span = this.createElement('span');
        span.contentEditable = true;
        span.classList.add('editable');

        if(todo.complete) {
          const strike = this.createElement('s');
          strike.textContent = todo.text;
          span.append(strike);
        } else {
          span.textContent = todo.text;
        }

        const deleteButton = this.createElement('button', 'delete');
        deleteButton.textContent = 'Delete';
        li.append(checkbox, span, deleteButton);

        this.todoList.append(li);
      })
    }
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', e => {
      e.preventDefault();

      if(this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', e => {
      if(e.target.className === 'delete') {
        const id = Number(e.target.parentElement.id);

        handler(id);
      }
    })
  }

  bindToggleTodo(handler) {
    // debugger;
    this.todoList.addEventListener('change', e => {
      if(e.target.type === 'checkbox') {
        const id = Number(e.target.parentElement.id);

        handler(id);
      }
    })
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // debugger;
    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);

    this.onTodoListChanged(this.model.todos);
  }

  onTodoListChanged = todos => {
    this.view.displayTodos(todos);
  }

  handleAddTodo = todoText => {
    this.model.addTodo(todoText);
  }

  handleDeleteTodo = id => {
    this.model.deleteTodo(id);
  }

  handleToggleTodo = id => {
    this.model.toggleTodo(id);
  }
}

const app = new Controller(new Model(), new View());
