import './style.css';

// CONSTANTS
const OPEN_TASKS_LIST_ID = 'openTasksList';
const DONE_TASKS_LIST_ID = 'doneTasksList';

// DOM ELEMENTS REFERENCES
const searchBox = document.getElementById('searchBox');
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addNewTaskBtn');
const clearAllOpenTasksLink = document.getElementById('clearOpenListLink');
const clearAllDoneTasksLink = document.getElementById('clearDoneListLink');
const openTasksListSorter = document.getElementById('openListSortElement');
const doneTasksListSorter = document.getElementById('doneListSortElement');

// GENERAL DOM FUNCTIONS
const reinitializeDomListWihValues = (listName, tasksArray) => {
  const tasksList = document.getElementById(listName);

  while (tasksList.firstChild) {
    tasksList.removeChild(tasksList.firstChild);
  }

  tasksArray.forEach(task => addNewTaskToDomList(listName, task));
};

// TASK CREATION
const createTask = taskText => {
  return {
    id: Math.random(),
    text: taskText,
    status: 'Open',
    creationDate: new Date(),
    dueDate: new Date(),
  };
};

// LOCAL STORAGE OPERATIONS
const getListFormLocalStorage = listName => {
  return JSON.parse(localStorage.getItem(listName));
};

const saveListElementToLocalStorage = (listName, listValue) => {
  if (!getListFormLocalStorage(listName)) {
    localStorage.setItem(listName, JSON.stringify([createTask(listValue)]));
  } else {
    const listFromLocalStorage = getListFormLocalStorage(listName);

    listFromLocalStorage.push(createTask(listValue));
    localStorage.setItem(listName, JSON.stringify(listFromLocalStorage));
  }
};

const changeTaskTextInLocalStorage = (listName, taskId, newText) => {
  if (getListFormLocalStorage(listName)) {
    const modifiedTasksList = getListFormLocalStorage(listName);
    modifiedTasksList.forEach(task => {
      if (task.id === taskId) {
        task.text = newText;
      }
    });
    localStorage.setItem(listName, JSON.stringify(modifiedTasksList));
  }
};

// "ADD A NEW TASK" HANDLING
const addNewTaskToDomList = (listName, task) => {
  const tasksList = document.getElementById(listName);
  const newListElement = document.createElement('li');

  // handle task editing on in JS
  // TODO: fix a problem with a duplicated inputs on multiple double click
  newListElement.addEventListener('dblclick', event => {
    const userTextInput = document.createElement('input');
    userTextInput.setAttribute('type', 'text');

    userTextInput.addEventListener('keyup', event => {
      event.preventDefault();
      if (event.keyCode === 13) {
        newListElement.innerText = userTextInput.value;
        changeTaskTextInLocalStorage(listName, task.id, userTextInput.value);
        newListElement.removeChild(userTextInput);
      } else if (event.keyCode === 27) {
        newListElement.removeChild(userTextInput);
      }
    });

    newListElement.appendChild(userTextInput);
  });

  const newListElementText = document.createTextNode(task.text);

  newListElement.appendChild(newListElementText);
  tasksList.appendChild(newListElement);
};

const addNewTaskToOpenListFromInputBox = () => {
  if (newTaskInput.value) {
    addNewTaskToDomList(OPEN_TASKS_LIST_ID, createTask(newTaskInput.value));

    saveListElementToLocalStorage(OPEN_TASKS_LIST_ID, newTaskInput.value);
    newTaskInput.value = '';
  }
};

addTaskBtn.addEventListener('click', () => {
  addNewTaskToOpenListFromInputBox();
});

newTaskInput.addEventListener('keydown', event => {
  if (event.keyCode === 13) {
    addNewTaskToOpenListFromInputBox();
  }
});

// SEARCH BOX OPERATIONS
searchBox.addEventListener('input', event => {
  if (getListFormLocalStorage(OPEN_TASKS_LIST_ID)) {
    const searchTermedOpenList = getListFormLocalStorage(
      OPEN_TASKS_LIST_ID,
    ).filter(task =>
      task.text.toLowerCase().includes(event.target.value.toLowerCase()),
    );

    reinitializeDomListWihValues(OPEN_TASKS_LIST_ID, searchTermedOpenList);
  }

  if (getListFormLocalStorage(DONE_TASKS_LIST_ID)) {
    const searchTermedDoneList = getListFormLocalStorage(
      DONE_TASKS_LIST_ID,
    ).filter(task =>
      task.text.toLowerCase().includes(event.target.value.toLowerCase()),
    );

    reinitializeDomListWihValues(DONE_TASKS_LIST_ID, searchTermedDoneList);
  }
});

// LIST SORTING OPERATIONS
openTasksListSorter.addEventListener('input', event => {
  //TODO: implement the actual sorting logic
  event.target.value;
});

doneTasksListSorter.addEventListener('input', event => {
  //TODO: implement the actual sorting logic
});

// CLEAR ALL ELEMENTS FROM LIST OPERATIONS
clearAllOpenTasksLink.addEventListener('click', () => {
  localStorage.removeItem(OPEN_TASKS_LIST_ID);

  reinitializeDomListWihValues(OPEN_TASKS_LIST_ID, []);
});

clearAllDoneTasksLink.addEventListener('click', event => {
  localStorage.removeItem(DONE_TASKS_LIST_ID);

  reinitializeDomListWihValues(DONE_TASKS_LIST_ID, []);
});

// INITIALIZAION OF LISTS FORM THE LOCAL STORAGE
const initializeListsFromLocalStorage = () => {
  if (getListFormLocalStorage(OPEN_TASKS_LIST_ID)) {
    getListFormLocalStorage(OPEN_TASKS_LIST_ID).forEach(listElement => {
      addNewTaskToDomList(OPEN_TASKS_LIST_ID, listElement);
    });
  }
};

initializeListsFromLocalStorage();
