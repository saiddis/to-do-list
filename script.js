class ToDoList {
    constructor() {
        this.weekDays = ['Sunday', 'Monday', 'Tuesday',
            'Wednesday','Thursday', 'Friday', 'Saturday'];
        this.months = ['January', 'February', 'March', 
            'April','May', 'June', 'July', 'August','September',
            'October', 'Novermber', 'December'];
        this.cachedTaskContainers = new Map(); /* (key = current .date element's textContent, value = current .task-container element)
on changing the current date, 
changeDate() function will put there current .task-container element and create a new one for the new date,
or replace with an existing .task-container element if the map has the new date as a key */ 

        this.arrowLeft = document.querySelector('.arrow-left');
        this.arrowRight = document.querySelector('.arrow-right');
        this.taskContainer = document.querySelector('.task-container');
        this.taskList = this.taskContainer.firstElementChild;
        this.completedTaskList = this.taskContainer.lastElementChild;
        this.addTaskButton = document.querySelector('.add-task-button');
        this.dateBar = document.querySelector('.date-bar');
        this.dateNode = this.dateBar.querySelector('.date');
        this.titleCompleted = this.completedTaskList.querySelector('.title-completed');
        this.themeSwitcher = document.querySelector('.theme-switcher');
        this.moonIcon = this.themeSwitcher.querySelector('.moon-icon');
        this.sunIcon = this.themeSwitcher.querySelector('.sun-icon')
        this.date = new Date();
        this.taskOrder = 0;
        this.checkBoxIcon = `
        <svg class="check-box" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="23" height="23" rx="3"/>
        <path class="tick" fill="#212529" d="M19.707,7.293a1,1,0,0,0-1.414,0L10,15.586,6.707,12.293a1,1,0,0,0-1.414,1.414l4,4a1,1,0,0,0,1.414,0l9-9A1,1,0,0,0,19.707,7.293Z"/>
        </svg>`;
        this.crossIcon = `
        <svg class="cross" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 5L5 19M5.00001 5L19 19" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        
        this.sunIcon.style.display = 'none';
        this.addTaskButton.style.left = document.documentElement.clientWidth / 2 - this.addTaskButton.clientWidth / 2 + 'px';
        this.taskContainer.style.top = this.dateBar.offsetHeight + 'px';
        this.dateNode.innerHTML = `${this.weekDays[this.date.getDay()]}, ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;
        
        this.addTask = this.addTask.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.onCheckBox = this.onCheckBox.bind(this);
        this.navigateOnKeydown = this.navigateOnKeydown.bind(this);

        this.addTaskButton.onclick = async () => {

            if (this.taskList.childNodes && 
                this.taskList.lastElementChild?.lastElementChild.value.trim() == false
            /* checking if there is no tasks with an empty input in the .task-list element */) {

                this.taskList.lastElementChild.lastElementChild.focus(); // refocus on the empty input
                return false; // prevent the .add-task-button element from adding a new task
            } else {
                let li = await Promise.resolve(this.addTask());
                this.taskList.append(li); 
                li.lastElementChild.focus(); // focus on the added task's input
            }
        };

        this.addTaskButton.onmousedown = () => {
            this.addTaskButton.classList.add('click');
        };

        this.addTaskButton.onmouseup = () => {
            this.addTaskButton.classList.remove('click');
        };

        this.dateBar.onclick = event => {
            this.changeDate(event);
        };
        this.themeSwitcher.onclick = () => {
            if (this.sunIcon.style.display == 'none') {
                this.moonIcon.style.display = 'none';
                this.sunIcon.style.display = '';
            } else {
                this.sunIcon.style.display = 'none';
                this.moonIcon.style.display = '';
            }

            document.documentElement.classList.toggle('dark');
        };
    };

    async navigateOnKeydown(event, input) {
        
        switch (event.key) {
            case 'Enter':
                if (!input.value.trim()) {
                    return false;
                }

                if (this.taskList.lastElementChild?.lastElementChild.value.trim() == false) {
                    this.taskList.lastElementChild.lastElementChild.focus();
                    return false;
                }

                const newLi = await Promise.resolve(this.addTask());
                input.parentElement.insertAdjacentElement('afterend', newLi);
                newLi.lastElementChild.focus();
                break;
            case 'Backspace':
                if (!input.value) {
                    const li = input.parentElement;
                    const previousLi = li.previousElementSibling;
                    li.remove();
                    if (!previousLi) return;
    
                    previousLi.lastElementChild.value += ' ';
                    previousLi.lastElementChild.focus();
                } 
                break;
            case 'ArrowUp':
                const previousLi = input.parentElement.previousElementSibling;
                if (previousLi) {
                    previousLi.lastElementChild.focus();
                    setTimeout(() => {
                        previousLi.lastElementChild.selectionStart =
                        previousLi.lastElementChild.selectionEnd =
                        input.selectionStart;
                    });
                    
                }
                break;
            case 'ArrowDown':
                const nextLi = input.parentElement.nextElementSibling;
                if (nextLi) {
                    nextLi.lastElementChild.focus()
                    setTimeout(() => {
                        nextLi.lastElementChild.selectionStart = 
                        nextLi.lastElementChild.selectionEnd = 
                        input.selectionStart;
                    });
                }
                break;
        }
    }

    changeDate(event) {
        let target = event.target.closest('svg');
        
        if (target == this.arrowRight) {
            this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1);
        } else if (target == this.arrowLeft) {
            this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() - 1);
        }

        let newDate = 
        `${this.weekDays[this.date.getDay()]}, ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;

        if (!this.cachedTaskContainers.has(this.dateNode.textContent)) {
            this.cachedTaskContainers.set(this.dateNode.textContent, this.taskContainer);
        }
        if (this.cachedTaskContainers.has(newDate)) {
            this.taskContainer.replaceWith(this.cachedTaskContainers.get(newDate));
            this.taskContainer = this.cachedTaskContainers.get(newDate);
            this.taskList = this.taskContainer.firstElementChild;
            this.completedTaskList = this.taskContainer.lastElementChild;
            this.titleCompleted = this.completedTaskList.firstElementChild;
        } else {
            let newTaskContainer = this.taskContainer.cloneNode(false);
            let newTaskList = this.taskList.cloneNode(false);
            let newCompletedTaskList = this.completedTaskList.cloneNode(false);
            let newTitleCompleted = this.titleCompleted.cloneNode(true);
            newCompletedTaskList.hidden = true;

            newCompletedTaskList.appendChild(newTitleCompleted);
            newTaskContainer.appendChild(newTaskList);
            newTaskContainer.appendChild(newCompletedTaskList);
            this.taskContainer.replaceWith(newTaskContainer);

            this.taskContainer = newTaskContainer;
            this.taskList = newTaskList;
            this.completedTaskList = newCompletedTaskList;
            this.titleCompleted = newTitleCompleted;
        }
        
        this.dateNode.textContent = newDate;
    };

    async addTask() {
        const li = document.createElement('li');
        const input = document.createElement('input');
        li.insertAdjacentHTML('afterbegin', this.crossIcon);
        li.insertAdjacentHTML('beforeend', this.checkBoxIcon);
        const cross = li.firstElementChild;
        const checkBox = cross.nextElementSibling;
        checkBox.lastElementChild.style.display = 'none';
        
        li.append(input);

        checkBox.onclick = event => this.onCheckBox(event);
        input.onkeydown = event => this.navigateOnKeydown(event, input);
        cross.onclick = () => {
            
            if (li.parentElement == this.completedTaskList &&
                this.completedTaskList.children.length == 2
                /* checking if the last two elements of .completed-task-list is its title and a task */) {

                this.completedTaskList.hidden = true; /* making the .completed-task-list not visible 
                since the last task in the .completed-task-list is to be removed */
            }

            li.remove();
        };

        return li;
    }; 

    onCheckBox(event) {
        const checkBox = event.target.closest('svg');

        if (!checkBox.nextElementSibling.value.trim()) { // if its input is empty

            checkBox.nextElementSibling.focus();
            return false; // prevent from adding the task to the .completed-task-list
        }

        const li = checkBox.parentElement;

        if (checkBox.lastElementChild.style.display == 'none') {
            checkBox.lastElementChild.style.display = '';
            checkBox.nextSibling.style.opacity = '0.3';
            if (this.completedTaskList.hidden) {
                this.completedTaskList.hidden = false;
            }

            this.completedTaskList.append(li);

        } else {
            checkBox.lastElementChild.style.display = 'none';
            checkBox.nextSibling.style.opacity = '1';
            this.taskList.prepend(li);
            if (this.titleCompleted == this.completedTaskList.lastElementChild) {
                this.completedTaskList.hidden = true;
            }
        }
    };
}; 

let toDoList = new ToDoList();