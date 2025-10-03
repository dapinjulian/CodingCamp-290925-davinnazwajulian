// Get DOM elements
const form = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const taskError = document.getElementById('taskError');
const dateError = document.getElementById('dateError');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const submitBtn = document.getElementById('submitBtn');

// Edit modal elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTaskInput = document.getElementById('editTaskInput');
const editDateInput = document.getElementById('editDateInput');
const editTaskError = document.getElementById('editTaskError');
const editDateError = document.getElementById('editDateError');
const cancelEditBtn = document.getElementById('cancelEdit');

// Filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);
editDateInput.setAttribute('min', today);

// Tasks array and state
let tasks = [];
let currentFilter = 'all';
let editingIndex = null;

// Form validation
function validateTask(task, errorElement) {
    errorElement.textContent = '';
    
    if (task.trim().length < 3) {
        errorElement.textContent = 'Task must be at least 3 characters long';
        return false;
    }
    
    return true;
}

function validateDate(date, errorElement) {
    errorElement.textContent = '';
    
    const selectedDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < currentDate) {
        errorElement.textContent = 'Date cannot be in the past';
        return false;
    }
    
    return true;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Check if date is overdue
function isOverdue(dateString) {
    const taskDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
}

// Filter tasks based on current filter
function getFilteredTasks() {
    if (currentFilter === 'all') {
        return tasks;
    } else if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }
    return tasks;
}

// Render tasks
function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        if (currentFilter !== 'all') {
            emptyState.textContent = `No ${currentFilter} tasks found.`;
        } else {
            emptyState.textContent = 'No tasks yet. Add one above!';
        }
        return;
    }
    
    emptyState.classList.add('hidden');
    
    filteredTasks.forEach((task) => {
        const originalIndex = tasks.indexOf(task);
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const overdueClass = !task.completed && isOverdue(task.date) ? 'overdue' : '';
        
        li.innerHTML = `
            <div class="checkbox-wrapper">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${originalIndex})">
            </div>
            <div class="task-content">
                <div class="task-title">${task.text}</div>
                <div class="task-date ${overdueClass}">
                    Due: ${formatDate(task.date)}
                    ${!task.completed && isOverdue(task.date) ? '(Overdue)' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="openEditModal(${originalIndex})">Edit</button>
                <button class="btn-delete" onclick="deleteTask(${originalIndex})">Delete</button>
            </div>
        `;
        
        taskList.appendChild(li);
    });
}

// Toggle task completion
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

// Add task
function addTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value;
    const taskDate = dateInput.value;
    
    // Validate inputs
    const isTaskValid = validateTask(taskText, taskError);
    const isDateValid = validateDate(taskDate, dateError);
    
    if (!isTaskValid || !isDateValid) {
        return;
    }
    
    // Add task to array
    tasks.push({
        text: taskText,
        date: taskDate,
        completed: false
    });
    
    // Clear form
    taskInput.value = '';
    dateInput.value = '';
    
    // Render tasks
    renderTasks();
}

// Open edit modal
function openEditModal(index) {
    editingIndex = index;
    const task = tasks[index];
    
    editTaskInput.value = task.text;
    editDateInput.value = task.date;
    editTaskError.textContent = '';
    editDateError.textContent = '';
    
    editModal.classList.add('active');
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    editingIndex = null;
}

// Save edited task
function saveEdit(e) {
    e.preventDefault();
    
    const taskText = editTaskInput.value;
    const taskDate = editDateInput.value;
    
    // Validate inputs
    const isTaskValid = validateTask(taskText, editTaskError);
    const isDateValid = validateDate(taskDate, editDateError);
    
    if (!isTaskValid || !isDateValid) {
        return;
    }
    
    // Update task
    tasks[editingIndex].text = taskText;
    tasks[editingIndex].date = taskDate;
    
    // Close modal and render
    closeEditModal();
    renderTasks();
}

// Delete task
function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(index, 1);
        renderTasks();
    }
}

// Handle filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Event listeners
form.addEventListener('submit', addTask);
editForm.addEventListener('submit', saveEdit);
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

// Initial render
renderTasks();