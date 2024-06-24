class TaskTracker {
    constructor() {
        this.weekDays = ['Sunday', 'Monday', 'Tuesday',
            'Wednesday','Thursday', 'Friday', 'Saturday'];
        this.months = ['January', 'February', 'March', 
            'April','May', 'June', 'July', 'August','September',
            'October', 'Novermber', 'December'];
        this.allTaskTrackers = new Map();

        this.previousButton = document.querySelector('.previous-button');
        this.nextButton = document.querySelector('.next-button');
        this.taskContainer = document.querySelector('.task-container');
        this.taskList = this.taskContainer.firstElementChild;
        this.completedTaskList = this.taskContainer.lastElementChild;
        this.addTaskButton = document.querySelector('.add-task-button');
        this.dateBar = document.querySelector('.date-bar');
        this.dateNode = document.querySelector('.date');
        this.titleCompleted = document.querySelector('.title-completed');
        this.date = new Date();
        this.taskOrder = 0;
        
        this.addTaskButton.style.left = document.documentElement.clientWidth / 2 - this.addTaskButton.clientWidth / 2 + 'px';
        this.addTaskButton.style.top = document.documentElement.clientHeight / 1.25 + 'px'; 
        this.taskContainer.style.top = this.dateBar.clientHeight + 'px';
        this.dateNode.innerHTML = `${this.weekDays[this.date.getDay()]}, ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;
        
        this.addTask = this.addTask.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.onCheckBox = this.onCheckBox.bind(this);

        this.addTaskButton.onclick = (event) => {
            if (this.taskList.childNodes &&
                this.taskList.lastElementChild?.lastElementChild.value.trim() == false) {
                    this.taskList.lastElementChild.lastElementChild.focus();
                    return false;
            } else {
                this.addTask(event);
            }
        };
        this.dateBar.onclick = event => {
            this.changeDate(event);
        };
    };

    changeDate(event) {
        let target = event.target.closest('button');
        if (!target) return;
        
        this.taskOrder = 0;
        if (target.className == 'next-button') {
           this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1);
        } else if (target.className == 'previous-button') {
            this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() - 1);
        }

        let newDate = `${this.weekDays[this.date.getDay()]}, ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;

        if (!this.allTaskTrackers.has(this.dateNode.innerHTML)) {
            this.allTaskTrackers.set(this.dateNode.innerHTML, this.taskContainer);
        }
        if (this.allTaskTrackers.has(newDate)) {
            this.taskContainer.replaceWith(this.allTaskTrackers.get(newDate));
            this.taskContainer = this.allTaskTrackers.get(newDate);
        } else {
            let newTaskContainer = this.taskContainer.cloneNode(false);
            let newTaskList = this.taskList.cloneNode(false);
            let newCompletedTaskList = this.completedTaskList.cloneNode(false);
            let newTitleCompleted = this.titleCompleted.cloneNode(true);

            newCompletedTaskList.appendChild(newTitleCompleted);
            newTaskContainer.appendChild(newTaskList, newCompletedTaskList);
            this.taskContainer.replaceWith(newTaskContainer);

            this.taskContainer = newTaskContainer;
            this.taskList = newTaskList;
            this.completedTaskList = newCompletedTaskList;
            this.titleCompleted = newTitleCompleted;
        }
        
        this.dateNode.innerHTML = newDate;
    };

    async addTask() {
        const li = document.createElement('li');
        const input = document.createElement('input');
        const checkBox = document.createElement('img');
        
        let uncheckedBox = await fetch('images/unchecked-box.svg');
        let uncheckedBoxBlob = await uncheckedBox.blob();
        let uncheckedBoxUrl = URL.createObjectURL(uncheckedBoxBlob);

        let checkedBox = await fetch('images/checked-box.svg');
        let checkedBoxBlob = await checkedBox.blob();
        let checkedBoxUrl = URL.createObjectURL(checkedBoxBlob);


        checkBox.className = 'check-box';
        checkBox.src = uncheckedBoxUrl;
        li.setAttribute('order', ++this.taskOrder);
        li.append(checkBox);
        li.append(input);
        this.taskList.append(li);
        input.focus();

        checkBox.onclick = event => this.onCheckBox(event, uncheckedBoxUrl, checkedBoxUrl);
    
        input.onkeydown = event => {
            switch (event.key) {
                case 'Enter':
                    if (!input.value.trim()) {
                        return;
                    }
                    this.addTask();
                    break;
                case 'Backspace':
                    if (!input.value.trim()) {
                        let previousLi = li.previousElementSibling;
                        li.remove();
                        if (!previousLi) return;
        
                        previousLi.lastElementChild.value += ' ';
                        previousLi.lastElementChild.focus();
                    } 
                    break;
                case 'ArrowUp':
                    if (li.previousElementSibling) {
                        li.previousElementSibling.lastElementChild.focus();
                    }
                    break;
                case 'ArrowDown':
                    if (li.nextElementSibling) {
                        li.nextElementSibling.lastElementChild.focus()
                    }
                    break;
            }
        };
    }; 

    onCheckBox(event, uncheckedBoxUrl, checkedBoxUrl) {
        const checkBox = event.target.closest('img');
        if (!checkBox) return;

        const li = checkBox.parentElement;    
        if (checkBox.src == uncheckedBoxUrl) {
            checkBox.src = checkedBoxUrl;
            checkBox.nextSibling.style.opacity = '0.3';
            if (this.completedTaskList.hidden) {
                this.completedTaskList.hidden = false;
            }
            this.completedTaskList.append(li);
        } else {
            checkBox.src = uncheckedBoxUrl;
            checkBox.nextSibling.style.opacity = '1';
            this.taskList.append(li);
            if (this.titleCompleted == this.completedTaskList.lastElementChild) {
                this.completedTaskList.hidden = true;
            }
        }
    };
}; 

let tracker = new TaskTracker();
