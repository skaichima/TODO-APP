// Select DOM elements
const todoForm = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const todoList = document.querySelector('.todo-list');

// Load todos from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Initial render
renderTodos();

// Add event listeners
todoForm.addEventListener('submit', addTodo);
todoList.addEventListener('click', handleTodoClick);

// Add new todo
function addTodo(e) {
    e.preventDefault();

    const todoText = todoInput.value.trim();
    if (!todoText) {
        shakeTodoInput();
        return;
    }

    const todo = {
        id: Date.now(),
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(todo); // Add to beginning instead of end
    saveTodos();
    renderTodos();
    todoInput.value = '';

    // Add animation to the new todo
    const firstTodo = todoList.firstElementChild;
    if (firstTodo) {
        firstTodo.style.animation = 'none';
        firstTodo.offsetHeight;
        firstTodo.style.animation = null;
    }
}

// Handle clicks on todo items 
function handleTodoClick(e) {
    const target = e.target;
    const todoItem = target.closest('.todo-item');

    if (!todoItem) return;

    const todoId = Number(todoItem.dataset.id);

    // Handle checkbox click
    if (target.classList.contains('todo-checkbox')) {
        toggleTodo(todoId);
    }

    // Handle delete button click
    if (target.classList.contains('todo-delete')) {
        deleteTodo(todoId);
    }
}

// Toggle todo completion status
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });

    saveTodos();
    renderTodos();
}

// Delete todo
function deleteTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    todoItem.style.animation = 'slideOut 0.3s ease forwards';

    setTimeout(() => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }, 300);
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todos to DOM
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = `
            <li class="todo-empty">
                <span>No tasks available. Add a new task to get started!</span>
            </li>
        `;
        return;
    }

    todoList.innerHTML = todos.map(todo => `
        <li class="todo-item" data-id="${todo.id}">
            <input type="checkbox" 
                   class="todo-checkbox" 
                   ${todo.completed ? 'checked' : ''}
                   aria-label="Mark task as complete">
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <button class="todo-delete" aria-label="Delete task">&times;</button>
        </li>
    `).join('');
    enableDragAndDrop();
}

// Add shake animation when input is empty
function shakeTodoInput() {
    todoInput.classList.add('shake');
    setTimeout(() => {
        todoInput.classList.remove('shake');
    }, 500);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== todoInput) {
        e.preventDefault();
        todoInput.focus();
    }
});

// Add drag and drop functionality
let draggedItem = null;

function enableDragAndDrop() {
    const todoItems = document.querySelectorAll('.todo-item');

    todoItems.forEach(item => {
        item.setAttribute('draggable', true);

        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            setTimeout(() => item.style.opacity = '0.5', 0);
        });

        item.addEventListener('dragend', () => {
            draggedItem.style.opacity = '1';
            draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(item, e.clientY);
            if (draggedItem !== item) {
                if (!afterElement) {
                    todoList.appendChild(draggedItem);
                } else {
                    todoList.insertBefore(draggedItem, afterElement);
                }
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.parentNode.querySelectorAll('.todo-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}