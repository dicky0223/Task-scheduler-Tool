// Modal management system
export function openProjectModal(projects, projectId = null, onSave) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('projectModalTitle');
    const form = document.getElementById('projectForm');

    if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            title.textContent = 'Edit Project';
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectDueDate').value = project.dueDate || '';
        }
    } else {
        title.textContent = 'Add Project';
        form.reset();
    }

    modal.classList.add('active');
    
    // Store the callback for saving
    modal._onSave = onSave;
    modal._editingId = projectId;
}

export function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.getElementById('projectForm').reset();
    modal._onSave = null;
    modal._editingId = null;
}

export function openTaskModal(projects, tasks, taskId = null, onSave) {
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('taskModalTitle');
    const form = document.getElementById('taskForm');

    // Populate project dropdown
    populateProjectFilter(projects, 'taskProject');

    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskProject').value = task.projectId;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskDueDate').value = task.dueDate || '';
        }
    } else {
        title.textContent = 'Add Task';
        form.reset();
    }

    modal.classList.add('active');
    
    // Store the callback for saving
    modal._onSave = onSave;
    modal._editingId = taskId;
}

export function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('active');
    document.getElementById('taskForm').reset();
    modal._onSave = null;
    modal._editingId = null;
}

export function populateProjectFilter(projects, selectId) {
    const select = document.getElementById(selectId);
    
    const projectOptions = projects.map(project => 
        `<option value="${project.id}">${project.name}</option>`
    ).join('');

    if (selectId === 'filterProject') {
        select.innerHTML = '<option value="">All Projects</option>' + projectOptions;
    } else {
        select.innerHTML = '<option value="">Select Project</option>' + projectOptions;
    }
}

// Initialize modal event listeners
export function initializeModalListeners() {
    // Project modal save handler
    document.getElementById('saveProject').addEventListener('click', () => {
        const modal = document.getElementById('projectModal');
        if (modal._onSave) {
            modal._onSave(modal._editingId);
        }
    });

    // Task modal save handler
    document.getElementById('saveTask').addEventListener('click', () => {
        const modal = document.getElementById('taskModal');
        if (modal._onSave) {
            modal._onSave(modal._editingId);
        }
    });

    // Close modal handlers
    document.getElementById('closeProjectModal').addEventListener('click', closeProjectModal);
    document.getElementById('cancelProjectModal').addEventListener('click', closeProjectModal);
    document.getElementById('closeTaskModal').addEventListener('click', closeTaskModal);
    document.getElementById('cancelTaskModal').addEventListener('click', closeTaskModal);

    // Modal overlay clicks
    document.getElementById('projectModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeProjectModal();
        }
    });

    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeTaskModal();
        }
    });
}