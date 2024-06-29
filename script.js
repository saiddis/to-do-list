class ToDoList {
    constructor() {
        this.weekDays = ['Sunday', 'Monday', 'Tuesday',
            'Wednesday','Thursday', 'Friday', 'Saturday'];
        this.months = ['January', 'February', 'March', 
            'April','May', 'June', 'July', 'August','September',
            'October', 'Novermber', 'December'];
        this.cachedTaskContainers = new Map();

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
        
        /* this.addTaskButton.style.left = document.documentElement.clientWidth / 2 - this.addTaskButton.clientWidth / 2 + 'px'; */
        /* this.addTaskButton.style.top = document.documentElement.clientHeight / 1.25 + 'px';  */
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
        let target = event.target.closest('button');
        if (!target) return;
        
        this.taskOrder = 0;
        if (target.className == 'next-button') {
           this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1);
        } else if (target.className == 'previous-button') {
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
        const checkBox = document.createElement('img');
        
        let uncheckedBox = await fetch('images/unchecked-box.svg');
        let uncheckedBoxBlob = await uncheckedBox.blob();
        let uncheckedBoxUrl = URL.createObjectURL(uncheckedBoxBlob);

        let checkedBox = await fetch('images/checked-box.svg');
        let checkedBoxBlob = await checkedBox.blob();
        let checkedBoxUrl = URL.createObjectURL(checkedBoxBlob);


        checkBox.className = 'check-box';
        checkBox.src = uncheckedBoxUrl;

        li.append(checkBox);
        li.append(input);
        checkBox.onclick = event => this.onCheckBox(event, uncheckedBoxUrl, checkedBoxUrl);
        input.onkeydown = event => {
            this.inputNavingation(event, input);
        };

        return li;
    }; 

    onCheckBox(event, uncheckedBoxUrl, checkedBoxUrl) {
        const checkBox = event.target.closest('img');
   
        if (!checkBox.nextElementSibling.value.trim()) {
            return false;
        }

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
            this.taskList.prepend(li);
            if (this.titleCompleted == this.completedTaskList.lastElementChild) {
                this.completedTaskList.hidden = true;
            }
        }
    };
}; 

let toDoList = new ToDoList();
