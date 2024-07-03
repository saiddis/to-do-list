class ToDoList {
    constructor() {
        this.weekDays = ['Sunday', 'Monday', 'Tuesday',
            'Wednesday','Thursday', 'Friday', 'Saturday'];
        this.months = ['January', 'February', 'March', 
            'April','May', 'June', 'July', 'August','September',
            'October', 'Novermber', 'December'];
        this.cachedTaskContainers = new Map();

        this.arrowLeft = document.querySelector('.arrow-left');
        this.arrowRight = document.querySelector('.arrow-right');
        this.taskContainer = document.querySelector('.task-container');
        this.taskList = this.taskContainer.firstElementChild;
        this.completedTaskList = this.taskContainer.lastElementChild;
        this.addTaskButton = document.querySelector('.add-task-button');
        this.dateBar = document.querySelector('.date-bar');
        this.dateNode = document.querySelector('.date');
        this.titleCompleted = document.querySelector('.title-completed');
        this.date = new Date();
        this.taskOrder = 0;
        this.checkBoxSvg = `
        <svg class="check-box" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#f8f9fa" stroke-width="1" stroke="#adb5bd" x="0.5" y="0.5" width="23" height="23" rx="3"/>
        <path class="tick" fill="#212529" d="M19.707,7.293a1,1,0,0,0-1.414,0L10,15.586,6.707,12.293a1,1,0,0,0-1.414,1.414l4,4a1,1,0,0,0,1.414,0l9-9A1,1,0,0,0,19.707,7.293Z"/>
        </svg>`;
        this.crossSvg = `
        <svg class="cross" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 5L5 19M5.00001 5L19 19" stroke="#000000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        
        this.addTaskButton.style.left = document.documentElement.clientWidth / 2 - this.addTaskButton.clientWidth / 2 + 'px';
        this.taskContainer.style.top = this.dateBar.clientHeight + 'px';
        this.dateNode.innerHTML = `${this.weekDays[this.date.getDay()]}, ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;
        
        this.addTask = this.addTask.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.onCheckBox = this.onCheckBox.bind(this);
        this.inputNavingation = this.inputNavingation.bind(this);

        this.addTaskButton.onclick = async () => {
            if (this.taskList.childNodes &&
                this.taskList.lastElementChild?.lastElementChild.value.trim() == false) {
                    this.taskList.lastElementChild.lastElementChild.focus();
                    return false;
            } else {
                let li = await Promise.resolve(this.addTask());
                this.taskList.append(li); 
                li.lastElementChild.focus();
        
            }
        };
        this.dateBar.onclick = event => {
            this.changeDate(event);
        };
    };

    async inputNavingation(event, input) {
        
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
                        previousLi.lastElementChild.selectionStart = previousLi.lastElementChild.selectionEnd = input.selectionStart;
                    });
                    
                }
                break;
            case 'ArrowDown':
                const nextLi = input.parentElement.nextElementSibling;
                if (nextLi) {
                    nextLi.lastElementChild.focus()
                    setTimeout(() => {
                        nextLi.lastElementChild.selectionStart = nextLi.lastElementChild.selectionEnd = input.selectionStart;
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

        let newDate = `${this.weekDays[this.date.getDay()]}, ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;

        if (!this.cachedTaskContainers.has(this.dateNode.innerHTML)) {
            this.cachedTaskContainers.set(this.dateNode.innerHTML, this.taskContainer);
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
        
        this.dateNode.innerHTML = newDate;
    };

    async addTask() {
        const li = document.createElement('li');
        const input = document.createElement('input');
        li.insertAdjacentHTML('afterbegin', this.crossSvg);
        li.insertAdjacentHTML('beforeend', this.checkBoxSvg);
        const cross = li.firstElementChild;
        const checkBox = cross.nextElementSibling;
        checkBox.lastElementChild.style.opacity = '0';
        
        li.append(input);

        checkBox.onclick = event => this.onCheckBox(event);
        input.onkeydown = event => this.inputNavingation(event, input);
        cross.onclick = () => {
            if (li.parentElement == this.completedTaskList &&
                this.completedTaskList.children.length == 2) {
                this.completedTaskList.hidden = true;
            }
            li.remove();
        };

        return li;
    }; 

    onCheckBox(event) {
        const checkBox = event.target.closest('svg');

        if (!checkBox.nextElementSibling.value.trim()) {
            checkBox.nextElementSibling.focus();
            return false;
        }

        const li = checkBox.parentElement;

        if (checkBox.lastElementChild.style.opacity == '0') {
            checkBox.lastElementChild.style.opacity = '1';
            checkBox.nextSibling.style.opacity = '0.3';
            if (this.completedTaskList.hidden) {
                this.completedTaskList.hidden = false;
            }
            this.completedTaskList.append(li);
        } else {
            checkBox.lastElementChild.style.opacity = '0';
            checkBox.nextSibling.style.opacity = '1';
            this.taskList.prepend(li);
            if (this.titleCompleted == this.completedTaskList.lastElementChild) {
                this.completedTaskList.hidden = true;
            }
        }
    };
}; 

let toDoList = new ToDoList();
