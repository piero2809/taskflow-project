// --- 1. ESTADO DE LA APLICACIÓN ---
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// --- 2. LÓGICA DE MODO OSCURO ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
const themeIcon = document.getElementById('theme-icon');

function initTheme() {
    const savedTheme = localStorage.getItem('taskflow_theme');
    // Detecta si el sistema operativo del usuario está en modo oscuro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = '🌙';
    }
}

darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('taskflow_theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
});

// Inicializamos el tema nada más cargar
initTheme();


// --- 3. GESTIÓN DE TAREAS ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const searchInput = document.getElementById('search-input');

function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    updateStats();
}

// Añadir nueva tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    tasks.push({
        id: Date.now().toString(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveTasks();
    taskInput.value = '';
    renderTasks();
});

// Renderizar tareas en el HTML
function renderTasks() {
    const taskList = document.getElementById('task-list');
    const template = document.getElementById('task-template').content;
    taskList.innerHTML = '';
    
    // Aplicar filtros y búsqueda
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = currentFilter === 'all' ? true :
                             currentFilter === 'completed' ? task.completed : !task.completed;
        return matchesSearch && matchesFilter;
    });

    filteredTasks.forEach(task => {
        const clone = template.cloneNode(true);
        const li = clone.querySelector('li');
        const titleSpan = clone.querySelector('.task-title');
        const checkbox = clone.querySelector('.task-checkbox');

        titleSpan.textContent = task.title;
        checkbox.checked = task.completed;

        // Estilos para tareas completadas (Diseño Moderno)
        if (task.completed) {
            titleSpan.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
            li.classList.remove('bg-white', 'dark:bg-slate-800');
            li.classList.add('bg-slate-50', 'dark:bg-slate-800/50', 'border-transparent');
        }

        // Asignar eventos a los botones de cada tarea
        checkbox.addEventListener('change', () => toggleTask(task.id));
        clone.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));
        clone.querySelector('.btn-edit').addEventListener('click', () => editTask(task.id));

        taskList.appendChild(clone);
    });

    updateStats();
    updateFilterStyles();
}

// Acciones individuales
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

// Estadísticas
function updateStats() {
    document.getElementById('stat-total').textContent = tasks.length;
    document.getElementById('stat-completed').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('stat-pending').textContent = tasks.filter(t => !t.completed).length;
}


// --- 4. FILTROS Y BÚSQUEDA ---
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

// Actualiza visualmente el botón de filtro que está seleccionado
function updateFilterStyles() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Reset a estado inactivo
        btn.classList.remove('bg-white', 'dark:bg-slate-700', 'text-teal-600', 'dark:text-teal-400', 'shadow-sm');
        btn.classList.add('text-slate-600', 'dark:text-slate-400');
        
        // Aplicar estado activo si coincide con currentFilter
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('bg-white', 'dark:bg-slate-700', 'text-teal-600', 'dark:text-teal-400', 'shadow-sm');
            btn.classList.remove('text-slate-600', 'dark:text-slate-400');
        }
    });
}

// Evento click para los filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});


// --- 5. ACCIONES MASIVAS ---
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


// --- 6. ARRANQUE DE LA APP ---
renderTasks();