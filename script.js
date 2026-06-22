// Initialize
let tasks = JSON.parse(localStorage.getItem('syntecxhub_tasks')) || [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const tasksList = document.getElementById('tasksList');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const progressFill = document.getElementById('progressFill');

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    
    if (taskText === '') {
        showNotification('Please enter a task! 📝');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: priority,
        createdAt: new Date().toLocaleDateString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
    showNotification('Task added successfully! ✨');
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    showNotification('Task deleted! 🗑️');
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks();
}

function getFilteredTasks() {
    switch(currentFilter) {
        case 'pending':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'high':
            return tasks.filter(t => t.priority === 'high');
        default:
            return tasks;
    }
}

function getPriorityEmoji(priority) {
    const emojis = { high: '🔴', medium: '🟡', low: '🟢' };
    return emojis[priority] || '🟡';
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-text">No tasks found!</div>
                <div class="empty-state-subtext">Try adjusting your filter</div>
            </div>
        `;
        updateStats();
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <div class="task-content">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-meta">${task.createdAt}</span>
            </div>
            <span class="priority-badge priority-${task.priority}">
                ${getPriorityEmoji(task.priority)} ${task.priority}
            </span>
            <div class="task-actions">
                <button class="btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </div>
    `).join('');

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;

    const percentage = total === 0 ? 0 : (completed / total) * 100;
    progressFill.style.width = percentage + '%';
}

function saveTasks() {
    localStorage.setItem('syntecxhub_tasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => notification.remove(), 3000);
}

// Initial render
renderTasks();
