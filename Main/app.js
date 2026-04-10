// Estado de la aplicación
let tasks = [];
let currentFilter = 'all'; // all, pending, completed
let searchQuery = '';

// Elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const template = document.getElementById('task-template').content;
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// Elementos de Estadísticas
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');

// Cargar inicial
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
});

// 7. Persistir datos con LocalStorage
function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    updateStats();
}

function loadTasks() {
    const stored = localStorage.getItem('taskflow_tasks');
    tasks = stored ? JSON.parse(stored) : [];
}

// 6. Añadir nueva tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    const newTask = {
        id: Date.now().toString(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
});

// Renderizar tareas usando la plantilla (Template)
function renderTasks() {
    taskList.innerHTML = '';
    
    // Aplicar filtros y búsqueda
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = 
            currentFilter === 'all' ? true :
            currentFilter === 'completed' ? task.completed : 
            !task.completed;
        return matchesSearch && matchesFilter;
    });

    // Crear elementos de la lista
    const fragment = document.createDocumentFragment();
    
    filteredTasks.forEach(task => {
        const clone = template.cloneNode(true);
        const li = clone.querySelector('li');
        const checkbox = clone.querySelector('.task-checkbox');
        const titleSpan = clone.querySelector('.task-title');
        const btnDelete = clone.querySelector('.btn-delete');
        const btnEdit = clone.querySelector('.btn-edit');

        if (task.completed) li.classList.add('completed');
        checkbox.checked = task.completed;
        titleSpan.textContent = task.title;

        // Toggle Completado
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        // Eliminar
        btnDelete.addEventListener('click', () => deleteTask(task.id));

        // Editar (Extra 8)
        btnEdit.addEventListener('click', () => editTask(task.id));

        fragment.appendChild(clone);
    });

    taskList.appendChild(fragment);
    updateStats();
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newTitle = prompt('Edita tu tarea:', task.title);
    if (newTitle !== null && newTitle.trim() !== '') {
        task.title = newTitle.trim();
        saveTasks();
        renderTasks();
    }
}

// 6. Actualizar estadísticas
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPending.textContent = pending;
}

// 8. Funcionalidades extra: Búsqueda y Filtros
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

// Acciones Masivas
document.getElementById('btn-complete-all').addEventListener('click', () => {
    tasks = tasks.map(t => ({ ...t, completed: true }));
    saveTasks();
    renderTasks();
});

document.getElementById('btn-clear-completed').addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
});