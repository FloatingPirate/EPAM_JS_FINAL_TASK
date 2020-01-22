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

// GENERAL FUNCTIONS
const randomInteger = (min, max) => {
  return min + Math.floor((max - min) * Math.random());
};

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
    id: randomInteger(0, 5000),
    text: taskText,
    status: 'Open',
    creationDate: new Date().toLocaleString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    dueDate: new Date().toLocaleString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
  };
};

// LOCAL STORAGE OPERATIONS
const getListFormLocalStorage = listName => {
  return JSON.parse(localStorage.getItem(listName));
};

const removeTaskFromLocalStorage = (listName, taskId) => {
  const modifiedTaskList = getListFormLocalStorage(listName).filter(
    task => task.id !== taskId,
  );

  localStorage.setItem(listName, JSON.stringify(modifiedTaskList));
};

const addTaskToListToLocalStorageFromText = (listName, text) => {
  if (!getListFormLocalStorage(listName)) {
    localStorage.setItem(listName, JSON.stringify([createTask(text)]));
  } else {
    const listFromLocalStorage = getListFormLocalStorage(listName);

    listFromLocalStorage.push(createTask(text));
    localStorage.setItem(listName, JSON.stringify(listFromLocalStorage));
  }
};

const addTaskToListToLocalStorage = (listName, task) => {
  if (!getListFormLocalStorage(listName)) {
    localStorage.setItem(listName, JSON.stringify([task]));
  } else {
    const listFromLocalStorage = getListFormLocalStorage(listName);

    listFromLocalStorage.push(task);
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
        newListElement.innerText = `${userTextInput.value} ${task.creationDate} ${task.dueDate}`;
        changeTaskTextInLocalStorage(listName, task.id, userTextInput.value);
        newListElement.removeChild(userTextInput);
      } else if (event.keyCode === 27) {
        newListElement.removeChild(userTextInput);
      }
    });

    newListElement.appendChild(userTextInput);
  });

  //Checkbox appearing logic
  const checkBoxToADoneList = document.createElement('input');
  checkBoxToADoneList.setAttribute('type', 'checkbox');
  newListElement.appendChild(checkBoxToADoneList);

  checkBoxToADoneList.addEventListener('click', event => {
    removeTaskFromLocalStorage(listName, task.id);
    reinitializeDomListWihValues(listName, getListFormLocalStorage(listName));

    if (listName === OPEN_TASKS_LIST_ID) {
      addTaskToListToLocalStorage(DONE_TASKS_LIST_ID, task);
      addNewTaskToDomList(DONE_TASKS_LIST_ID, task);
    } else {
      addTaskToListToLocalStorage(OPEN_TASKS_LIST_ID, task);
      addNewTaskToDomList(OPEN_TASKS_LIST_ID, task);
    }
  });

  const binIcon = document.createElement('img');
  binIcon.setAttribute('class', 'epam-js-task bin-icon');
  binIcon.setAttribute('src', '../resources/bin_icon.png');
  binIcon.style.display = 'none';
  newListElement.appendChild(binIcon);

  binIcon.addEventListener('click', event => {
    removeTaskFromLocalStorage(listName, task.id);
    reinitializeDomListWihValues(listName, getListFormLocalStorage(listName));
  });

  newListElement.addEventListener('mouseover', event => {
    binIcon.style.display = 'inline';
  });

  newListElement.addEventListener('mouseout', event => {
    binIcon.style.display = 'none';
  });

  const taskText = document.createTextNode(task.text);
  const taskCreationDate = document.createTextNode(task.creationDate);
  const taskDueDate = document.createTextNode(task.dueDate);

  const dateDiv = document.createElement('div');
  dateDiv.setAttribute('class', 'epam-js-task-date');
  newListElement.setAttribute('class', 'epam-js-task');
  newListElement.appendChild(taskText);
  newListElement.appendChild(taskCreationDate);
  newListElement.appendChild(taskDueDate);

  tasksList.appendChild(newListElement);
};

const addNewTaskToOpenListFromInputBox = () => {
  if (newTaskInput.value) {
    addNewTaskToDomList(OPEN_TASKS_LIST_ID, createTask(newTaskInput.value));

    addTaskToListToLocalStorageFromText(OPEN_TASKS_LIST_ID, newTaskInput.value);
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
  let sortedTaskList;

  if (event.target.value === 'Text(ASC)') {
    sortedTaskList = getListFormLocalStorage(OPEN_TASKS_LIST_ID).sort(
      (t1, t2) => t1.text > t2.text,
    );
  } else if (event.target.value === 'Text(DESC)') {
    sortedTaskList = getListFormLocalStorage(OPEN_TASKS_LIST_ID).sort(
      (t1, t2) => t1.text < t2.text,
    );
  } else if (event.target.value === 'Creation date(ASC)') {
    sortedTaskList = getListFormLocalStorage(OPEN_TASKS_LIST_ID).sort(
      (t1, t2) => t1.creationDate < t2.creationDate,
    );
  } else if (event.target.value === 'Creation date(DESC)') {
    sortedTaskList = getListFormLocalStorage(OPEN_TASKS_LIST_ID).sort(
      (t1, t2) => t1.creationDate > t2.creationDate,
    );
  }
  localStorage.setItem(OPEN_TASKS_LIST_ID, JSON.stringify(sortedTaskList));
  reinitializeDomListWihValues(OPEN_TASKS_LIST_ID, sortedTaskList);
});

doneTasksListSorter.addEventListener('input', event => {
  let sortedTaskList;

  if (event.target.value === 'Text(ASC)') {
    sortedTaskList = getListFormLocalStorage(DONE_TASKS_LIST_ID).sort(
      (t1, t2) => t1.text > t2.text,
    );
  } else if (event.target.value === 'Text(DESC)') {
    sortedTaskList = getListFormLocalStorage(DONE_TASKS_LIST_ID).sort(
      (t1, t2) => t1.text < t2.text,
    );
  } else if (event.target.value === 'Due date(ASC)') {
    sortedTaskList = getListFormLocalStorage(DONE_TASKS_LIST_ID).sort(
      (t1, t2) => t1.dueDate < t2.dueDate,
    );
  } else if (event.target.value === 'Due date(DESC)') {
    sortedTaskList = getListFormLocalStorage(DONE_TASKS_LIST_ID).sort(
      (t1, t2) => t1.dueDate > t2.dueDate,
    );
  }
  localStorage.setItem(DONE_TASKS_LIST_ID, JSON.stringify(sortedTaskList));
  reinitializeDomListWihValues(DONE_TASKS_LIST_ID, sortedTaskList);
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

  if (getListFormLocalStorage(DONE_TASKS_LIST_ID)) {
    getListFormLocalStorage(DONE_TASKS_LIST_ID).forEach(listElement => {
      addNewTaskToDomList(DONE_TASKS_LIST_ID, listElement);
    });
  }
};

initializeListsFromLocalStorage();
