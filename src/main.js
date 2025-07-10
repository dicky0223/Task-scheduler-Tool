// Main application controller
import { loadData } from './data/dbService.js';
import { showToast } from './ui/toast.js';
import { initializeTheme, toggleTheme } from './ui/theme.js';
import { 
    openProjectModal, 
    closeProjectModal, 
    openTaskModal, 
    closeTaskModal, 
    populateProjectFilter,
    initializeModalListeners 
} from './ui/modals.js';
import { 
    renderDashboard, 
    renderCalendar, 
    renderProjects, 
    renderTasks, 
    renderKanban,
    displayTasksForDate
} from './ui/renderers.js';
import { getStatusClass } from './utils/helpers.js';

// ProjectFlow - Project Management Application
class ProjectManager {
    constructor() {
        this.projects = [];
        this.tasks = [];
        this.currentView = 'dashboard';
        this.currentDate = new Date();
        
        this.init();
    }

    async init() {
        try {
            // Initialize database
            await projectFlowDB.openDatabase();
            
            // Load data from IndexedDB
            const data = await loadData();
            this.projects = data.projects;
            this.tasks = data.tasks;
            
            // Initialize UI
            this.initializeEventListeners();
            initializeTheme();
            this.renderDashboard();
            this.renderCalendar();
            
            console.log('ProjectFlow initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ProjectFlow:', error);
            showToast('Failed to initialize application', 'error');
        }
    }

    initializeEventListeners() {
        // Initialize modal listeners
        initializeModalListeners();

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            toggleTheme();
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Project modal triggers
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });
        
        document.getElementById('quickAddProject').addEventListener('click', () => {
            this.openProjectModal();
        });

        // Task modal triggers
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });
        
        document.getElementById('quickAddTask').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Task filters
        document.getElementById('filterProject').addEventListener('change', () => {
            this.renderTasks();
        });

        document.getElementById('filterPriority').addEventListener('change', () => {
            this.renderTasks();
        });

        document.getElementById('filterStatus').addEventListener('change', () => {
            this.renderTasks();
        });

        // View toggles
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const viewType = e.currentTarget.dataset.viewType;
                this.switchTaskView(viewType);
            });
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        document.getElementById(`${view}View`).classList.add('active');

        this.currentView = view;

        // Render appropriate content
        switch (view) {
            case 'dashboard':
                this.renderDashboard();
                this.renderCalendar();
                break;
            case 'projects':
                this.renderProjects();
                break;
            case 'tasks':
                this.renderTasks();
                this.populateTaskProjectFilter();
                break;
        }
    }

    switchTaskView(viewType) {
        // Update toggle buttons
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
        document.querySelector(`[data-view-type="${viewType}"]`).classList.add('active');

        // Show/hide views
        if (viewType === 'list') {
            document.getElementById('taskListView').classList.remove('hidden');
            document.getElementById('kanbanView').classList.add('hidden');
        } else {
            document.getElementById('taskListView').classList.add('hidden');
            document.getElementById('kanbanView').classList.remove('hidden');
            this.renderKanban();
        }
    }

    // Rendering methods
    renderDashboard() {
        renderDashboard(this.projects, this.tasks);
    }

    renderCalendar() {
        renderCalendar(this.currentDate, this.projects, this.tasks, (dateString) => {
            displayTasksForDate(dateString, this.projects, this.tasks);
        });
    }

    renderProjects() {
        renderProjects(this.projects, this.tasks, 
            (id) => this.editProject(id), 
            (id) => this.deleteProject(id)
        );
    }

    renderTasks() {
        renderTasks(this.projects, this.tasks,
            (id) => this.editTask(id),
            (id) => this.deleteTask(id),
            (id) => this.toggleTaskStatus(id)
        );
    }

    renderKanban() {
        renderKanban(this.projects, this.tasks, (id) => this.editTask(id));
    }

    populateTaskProjectFilter() {
        populateProjectFilter(this.projects, 'filterProject');
        populateProjectFilter(this.projects, 'taskProject');
    }

    // Project CRUD operations
    openProjectModal(projectId = null) {
        openProjectModal(this.projects, projectId, (editingId) => this.saveProject(editingId));
    }

    async saveProject(editingId) {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const status = document.getElementById('projectStatus').value;
        const dueDate = document.getElementById('projectDueDate').value;

        if (!name) {
            showToast('Project name is required', 'error');
            return;
        }

        try {
            const projectData = {
                name,
                description,
                status,
                dueDate: dueDate || null
            };

            if (editingId) {
                // Update existing project
                const existingProject = this.projects.find(p => p.id === editingId);
                const updatedProject = { ...existingProject, ...projectData };
                
                await projectFlowDB.updateProject(updatedProject);
                
                const index = this.projects.findIndex(p => p.id === editingId);
                this.projects[index] = updatedProject;
                
                showToast('Project updated successfully', 'success');
            } else {
                // Create new project
                const newProject = {
                    id: 'proj-' + Date.now(),
                    ...projectData,
                    createdDate: new Date().toISOString().split('T')[0]
                };

                await projectFlowDB.addProject(newProject);
                this.projects.push(newProject);
                
                showToast('Project created successfully', 'success');
            }

            closeProjectModal();
            this.renderProjects();
            this.renderDashboard();
            this.populateTaskProjectFilter();
        } catch (error) {
            console.error('Error saving project:', error);
            showToast('Error saving project', 'error');
        }
    }

    editProject(projectId) {
        this.openProjectModal(projectId);
    }

    async deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
            return;
        }

        try {
            // Delete project and associated tasks
            await projectFlowDB.deleteProject(projectId);
            await projectFlowDB.deleteTasksByProject(projectId);

            // Update local arrays
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.tasks = this.tasks.filter(t => t.projectId !== projectId);

            showToast('Project deleted successfully', 'success');
            this.renderProjects();
            this.renderDashboard();
            this.populateTaskProjectFilter();
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast('Error deleting project', 'error');
        }
    }

    // Task CRUD operations
    openTaskModal(taskId = null) {
        openTaskModal(this.projects, this.tasks, taskId, (editingId) => this.saveTask(editingId));
    }

    async saveTask(editingId) {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const projectId = document.getElementById('taskProject').value;
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            showToast('Task title is required', 'error');
            return;
        }

        if (!projectId) {
            showToast('Please select a project', 'error');
            return;
        }

        try {
            const taskData = {
                title,
                description,
                projectId,
                priority,
                status,
                dueDate: dueDate || null
            };

            if (editingId) {
                // Update existing task
                const existingTask = this.tasks.find(t => t.id === editingId);
                const updatedTask = { ...existingTask, ...taskData };
                
                await projectFlowDB.updateTask(updatedTask);
                
                const index = this.tasks.findIndex(t => t.id === editingId);
                this.tasks[index] = updatedTask;
                
                showToast('Task updated successfully', 'success');
            } else {
                // Create new task
                const newTask = {
                    id: 'task-' + Date.now(),
                    ...taskData,
                    createdDate: new Date().toISOString().split('T')[0]
                };

                await projectFlowDB.addTask(newTask);
                this.tasks.push(newTask);
                
                showToast('Task created successfully', 'success');
            }

            closeTaskModal();
            this.renderTasks();
            this.renderDashboard();
            this.renderCalendar();
        } catch (error) {
            console.error('Error saving task:', error);
            showToast('Error saving task', 'error');
        }
    }

    editTask(taskId) {
        this.openTaskModal(taskId);
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await projectFlowDB.deleteTask(taskId);
            this.tasks = this.tasks.filter(t => t.id !== taskId);

            showToast('Task deleted successfully', 'success');
            this.renderTasks();
            this.renderDashboard();
            this.renderCalendar();
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('Error deleting task', 'error');
        }
    }

    async toggleTaskStatus(taskId) {
        try {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            const newStatus = task.status === 'completed' ? 'todo' : 'completed';
            const updatedTask = { ...task, status: newStatus };

            await projectFlowDB.updateTask(updatedTask);
            
            const index = this.tasks.findIndex(t => t.id === taskId);
            this.tasks[index] = updatedTask;

            showToast(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`, 'success');
            this.renderTasks();
            this.renderDashboard();
            this.renderCalendar();
        } catch (error) {
            console.error('Error toggling task status:', error);
            showToast('Error updating task status', 'error');
        }
    }

    // Utility functions
    handleGlobalSearch(query) {
        if (!query.trim()) return;

        const results = [];
        
        // Search projects
        this.projects.forEach(project => {
            if (project.name.toLowerCase().includes(query.toLowerCase()) ||
                (project.description && project.description.toLowerCase().includes(query.toLowerCase()))) {
                results.push({ type: 'project', item: project });
            }
        });

        // Search tasks
        this.tasks.forEach(task => {
            if (task.title.toLowerCase().includes(query.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(query.toLowerCase()))) {
                results.push({ type: 'task', item: task });
            }
        });

        // Show search results (you can implement a dropdown or modal for this)
        console.log('Search results:', results);
    }
}

// Initialize the application
const projectManager = new ProjectManager();

// Make projectManager globally available for onclick handlers
window.projectManager = projectManager;

export default projectManager;