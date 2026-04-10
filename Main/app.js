// Dentro de tu app.js...

// --- Renderizado con Clases de Tailwind Actualizadas ---
function renderTasks() {
    const taskList = document.getElementById('task-list');
    const template = document.getElementById('task-template').content;
    taskList.innerHTML = '';
    
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

        if (task.completed) {
            // Actualizamos los colores de la tarea tachada para el nuevo diseño
            titleSpan.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
            li.classList.add('bg-slate-50', 'dark:bg-slate-800/50', 'border-transparent');
        }

        // Eventos
        checkbox.addEventListener('change', () => toggleTask(task.id));
        clone.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));
        clone.querySelector('.btn-edit').addEventListener('click', () => editTask(task.id));

        taskList.appendChild(clone);
    });

    updateStats();
    updateFilterStyles(); // Llamamos a esta nueva función
}

// NUEVA FUNCIÓN: Actualiza el diseño visual de los filtros activos
function updateFilterStyles() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Estilos por defecto (inactivos)
        btn.classList.remove('bg-white', 'dark:bg-slate-700', 'text-teal-600', 'dark:text-teal-400', 'shadow-sm');
        btn.classList.add('text-slate-600', 'dark:text-slate-400');
        
        // Estilo activo
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('bg-white', 'dark:bg-slate-700', 'text-teal-600', 'dark:text-teal-400', 'shadow-sm');
            btn.classList.remove('text-slate-600', 'dark:text-slate-400');
        }
    });
}

// Sustituye tu antiguo código de filterBtns por este:
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentFilter = e.target.dataset.filter;
        renderTasks(); // renderTasks ahora llama a updateFilterStyles
    });
});