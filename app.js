// Project Management Application
class ProjectManager {
    constructor() {
        this.projects = [];
        this.tasks = [];
        this.currentEditingProject = null;
        this.currentEditingTask = null;
        this.currentView = 'dashboard';
        this.currentTaskView = 'list';
        this.currentCalendarDate = new Date();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.loadData().then(() => {
            this.setupEventListeners();
            this.renderDashboard();
            this.initializeTheme();
        }).catch(error => {
            console.error('Failed to initialize app:', error);
            this.showToast('Failed to initialize application', 'error');
        });
    }

    // Data Management
    async loadData() {
        try {
            // Try to load data from IndexedDB first
            const dbProjects = await projectFlowDB.getAllProjects();
            const dbTasks = await projectFlowDB.getAllTasks();
            
            if (dbProjects.length > 0 || dbTasks.length > 0) {
                // Data exists in IndexedDB
                this.projects = dbProjects;
                this.tasks = dbTasks;
                return;
            }
            
            // Check for localStorage data to migrate
            const savedProjects = localStorage.getItem('projectflow_projects');
            const savedTasks = localStorage.getItem('projectflow_tasks');
            
            if (savedProjects && savedTasks) {
                // Migrate from localStorage to IndexedDB
                const localProjects = JSON.parse(savedProjects);
                const localTasks = JSON.parse(savedTasks);
                
                await projectFlowDB.bulkAddProjects(localProjects);
                await projectFlowDB.bulkAddTasks(localTasks);
                
                // Clear localStorage after successful migration
                localStorage.removeItem('projectflow_projects');
                localStorage.removeItem('projectflow_tasks');
                
                this.projects = localProjects;
                this.tasks = localTasks;
                
                this.showToast('Data migrated to IndexedDB successfully', 'success');
                return;
            }
            
            // No existing data, load sample data
            const sampleProjects = [
                {
                    "id": "proj-1",
                    "name": "Website Redesign",
                    "description": "Complete overhaul of company website with modern design and improved UX",
                    "status": "active",
                    "dueDate": "2025-07-15",
                    "createdDate": "2025-06-01"
                },
                {
                    "id": "proj-2", 
                    "name": "Mobile App Development",
                    "description": "Develop cross-platform mobile application for iOS and Android",
                    "status": "active",
                    "dueDate": "2025-08-30",
                    "createdDate": "2025-05-15"
                },
                {
                    "id": "proj-3",
                    "name": "Marketing Campaign Q3",
                    "description": "Launch comprehensive marketing campaign for Q3 product launch",
                    "status": "completed",
                    "dueDate": "2025-06-30",
                    "createdDate": "2025-04-01"
                },
                {
                    "id": "proj-4",
                    "name": "Database Migration",
                    "description": "Migrate legacy database to cloud infrastructure",
                    "status": "on-hold",
                    "dueDate": "2025-09-15",
                    "createdDate": "2025-05-01"
                }
            ];
            
            const sampleTasks = [
                {
                    "id": "task-1",
                    "title": "Create wireframes",
                    "description": "Design wireframes for all main pages",
                    "projectId": "proj-1",
                    "priority": "high",
                    "status": "completed",
                    "dueDate": "2025-06-15",
                    "createdDate": "2025-06-01"
                },
                {
                    "id": "task-2",
                    "title": "Design mockups",
                    "description": "Create high-fidelity mockups based on wireframes",
                    "projectId": "proj-1", 
                    "priority": "high",
                    "status": "in-progress",
                    "dueDate": "2025-06-20",
                    "createdDate": "2025-06-02"
                },
                {
                    "id": "task-3",
                    "title": "Frontend development",
                    "description": "Implement responsive frontend using React",
                    "projectId": "proj-1",
                    "priority": "medium",
                    "status": "todo",
                    "dueDate": "2025-07-01",
                    "createdDate": "2025-06-03"
                },
                {
                    "id": "task-4",
                    "title": "User research",
                    "description": "Conduct user interviews and surveys",
                    "projectId": "proj-2",
                    "priority": "high",
                    "status": "completed",
                    "dueDate": "2025-06-05",
                    "createdDate": "2025-05-20"
                },
                {
                    "id": "task-5",
                    "title": "App architecture",
                    "description": "Define technical architecture and stack",
                    "projectId": "proj-2",
                    "priority": "high", 
                    "status": "in-progress",
                    "dueDate": "2025-06-25",
                    "createdDate": "2025-05-25"
                },
                {
                    "id": "task-6",
                    "title": "API development",
                    "description": "Build REST API for mobile app",
                    "projectId": "proj-2",
                    "priority": "medium",
                    "status": "todo",
                    "dueDate": "2025-07-15",
                    "createdDate": "2025-06-01"
                },
                {
                    "id": "task-7",
                    "title": "Content strategy",
                    "description": "Develop content calendar and messaging",
                    "projectId": "proj-3",
                    "priority": "medium",
                    "status": "completed",
                    "dueDate": "2025-05-15",
                    "createdDate": "2025-04-10"
                },
                {
                    "id": "task-8",
                    "title": "Social media campaign",
                    "description": "Execute social media marketing campaign",
                    "projectId": "proj-3",
                    "priority": "high",
                    "status": "completed",
                    "dueDate": "2025-06-15",
                    "createdDate": "2025-04-15"
                },
                {
                    "id": "task-9",
                    "title": "Data audit",
                    "description": "Audit current database structure and data quality",
                    "projectId": "proj-4",
                    "priority": "high",
                    "status": "todo",
                    "dueDate": "2025-06-30",
                    "createdDate": "2025-05-10"
                },
                {
                    "id": "task-10",
                    "title": "Migration plan",
                    "description": "Create detailed migration strategy and timeline",
                    "projectId": "proj-4",
                    "priority": "medium",
                    "status": "todo",
                    "dueDate": "2025-07-15",
                    "createdDate": "2025-05-15"
                }
            ];
            
            // Save sample data to IndexedDB
            await projectFlowDB.bulkAddProjects(sampleProjects);
            await projectFlowDB.bulkAddTasks(sampleTasks);
            
            this.projects = sampleProjects;
            this.tasks = sampleTasks;
            
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showToast('Failed to load data from database', 'error');
            
            // Fallback to empty arrays
            this.projects = [];
            this.tasks = [];
        }
    }

    async refreshData() {
        try {
            this.projects = await projectFlowDB.getAllProjects();
            this.tasks = await projectFlowDB.getAllTasks();
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showToast('Failed to refresh data', 'error');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                this.switchView(view);
            });
        });
        
        // Calendar task modal event listeners
        document.getElementById('closeCalendarTaskModal').addEventListener('click', () => this.hideCalendarTaskModal());
        document.getElementById('closeCalendarTaskModalBtn').addEventListener('click', () => this.hideCalendarTaskModal());
        document.getElementById('calendarTaskModal').addEventListener('click', (e) => {
            if (e.target.id === 'calendarTaskModal') {
                this.hideCalendarTaskModal();
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Modal controls
        this.setupModalListeners();

        // Quick actions
        const quickAddProject = document.getElementById('quickAddProject');
        if (quickAddProject) {
            quickAddProject.addEventListener('click', () => {
                this.openProjectModal();
            });
        }

        const quickAddTask = document.getElementById('quickAddTask');
        if (quickAddTask) {
            quickAddTask.addEventListener('click', () => {
                this.openTaskModal();
            });
        }

        // Project actions
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.openProjectModal();
            });
        }

        // Task actions
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.openTaskModal();
            });
        }

        // Task view toggles
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const viewType = e.currentTarget.getAttribute('data-view-type');
                this.switchTaskView(viewType);
            });
        });

        // Task filters
        const filterProject = document.getElementById('filterProject');
        if (filterProject) {
            filterProject.addEventListener('change', () => {
                this.renderTasks();
            });
        }

        const filterPriority = document.getElementById('filterPriority');
        if (filterPriority) {
            filterPriority.addEventListener('change', () => {
                this.renderTasks();
            });
        }

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) {
            filterStatus.addEventListener('change', () => {
                this.renderTasks();
            });
        }

        // Calendar navigation
        const prevMonth = document.getElementById('prevMonth');
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.navigateCalendar(-1);
            });
        }

        const nextMonth = document.getElementById('nextMonth');
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.navigateCalendar(1);
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (mobileMenuToggle && sidebar && sidebarOverlay) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
            
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Close mobile sidebar when navigation link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        });
    }

    setupModalListeners() {
        // Project modal
        const closeProjectModal = document.getElementById('closeProjectModal');
        if (closeProjectModal) {
            closeProjectModal.addEventListener('click', () => {
                this.closeProjectModal();
            });
        }

        const cancelProjectModal = document.getElementById('cancelProjectModal');
        if (cancelProjectModal) {
            cancelProjectModal.addEventListener('click', () => {
                this.closeProjectModal();
            });
        }

        const saveProject = document.getElementById('saveProject');
        if (saveProject) {
            saveProject.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProject().catch(error => {
                    console.error('Save project error:', error);
                });
            });
        }

        // Task modal
        const closeTaskModal = document.getElementById('closeTaskModal');
        if (closeTaskModal) {
            closeTaskModal.addEventListener('click', () => {
                this.closeTaskModal();
            });
        }

        const cancelTaskModal = document.getElementById('cancelTaskModal');
        if (cancelTaskModal) {
            cancelTaskModal.addEventListener('click', () => {
                this.closeTaskModal();
            });
        }

        const saveTask = document.getElementById('saveTask');
        if (saveTask) {
            saveTask.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveTask().catch(error => {
                    console.error('Save task error:', error);
                });
            });
        }

        // Close modals on overlay click
        const projectModal = document.getElementById('projectModal');
        if (projectModal) {
            projectModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeProjectModal();
                }
            });
        }

        const taskModal = document.getElementById('taskModal');
        if (taskModal) {
            taskModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeTaskModal();
                }
            });
        }
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('projectflow_theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('projectflow_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Navigation
    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-view="${view}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update views
        document.querySelectorAll('.view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        const activeView = document.getElementById(`${view}View`);
        if (activeView) {
            activeView.classList.add('active');
        }

        this.currentView = view;

        // Smooth scroll to top when switching views
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Render content
        switch (view) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'projects':
                this.renderProjects();
                break;
            case 'tasks':
                this.renderTasks();
                this.populateProjectFilters();
                break;
        }
    }

    // Mobile sidebar management
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('mobile-open');
            
            if (isOpen) {
                this.closeMobileSidebar();
            } else {
                this.openMobileSidebar();
            }
        }
    }

    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    switchTaskView(viewType) {
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
        const activeToggle = document.querySelector(`[data-view-type="${viewType}"]`);
        if (activeToggle) {
            activeToggle.classList.add('active');
        }

        const taskListView = document.getElementById('taskListView');
        const kanbanView = document.getElementById('kanbanView');

        if (viewType === 'list') {
            if (taskListView) taskListView.classList.remove('hidden');
            if (kanbanView) kanbanView.classList.add('hidden');
        } else {
            if (taskListView) taskListView.classList.add('hidden');
            if (kanbanView) kanbanView.classList.remove('hidden');
            this.renderKanban();
        }

        this.currentTaskView = viewType;
    }

    // Dashboard Rendering
    renderDashboard() {
        this.updateDashboardStats();
        this.renderActivityFeed();
        this.renderCalendar();
    }

    updateDashboardStats() {
        const totalProjects = this.projects.length;
        const activeTasks = this.tasks.filter(task => task.status !== 'completed').length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const today = new Date().toISOString().split('T')[0];
        const tasksDueToday = this.tasks.filter(task => task.dueDate === today).length;

        const totalProjectsEl = document.getElementById('totalProjects');
        const activeTasksEl = document.getElementById('activeTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        const tasksDueTodayEl = document.getElementById('tasksDueToday');

        if (totalProjectsEl) totalProjectsEl.textContent = totalProjects;
        if (activeTasksEl) activeTasksEl.textContent = activeTasks;
        if (completedTasksEl) completedTasksEl.textContent = completedTasks;
        if (tasksDueTodayEl) tasksDueTodayEl.textContent = tasksDueToday;
    }

    renderActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        const recentTasks = this.tasks
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 5);

        activityFeed.innerHTML = recentTasks.map(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            return `
                <div class="activity-item">
                    <div class="activity-text">
                        Task "${task.title}" was created in ${project ? project.name : 'Unknown Project'}
                    </div>
                    <div class="activity-time">${this.formatDate(task.createdDate)}</div>
                </div>
            `;
        }).join('');
    }

    // Calendar functionality
    renderCalendar() {
        const calendarContainer = document.getElementById('calendarContainer');
        const monthYearDisplay = document.getElementById('calendarMonthYear');
        
        if (!calendarContainer || !monthYearDisplay) return;

        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        // Update month/year display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Create calendar HTML
        let calendarHTML = `
            <div class="calendar-grid">
                <div class="calendar-header">
                    <div class="calendar-day-header">Sun</div>
                    <div class="calendar-day-header">Mon</div>
                    <div class="calendar-day-header">Tue</div>
                    <div class="calendar-day-header">Wed</div>
                    <div class="calendar-day-header">Thu</div>
                    <div class="calendar-day-header">Fri</div>
                    <div class="calendar-day-header">Sat</div>
                </div>
                <div class="calendar-body">
        `;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasksForDay = this.tasks.filter(task => task.dueDate === dateString);
            const isToday = dateString === new Date().toISOString().split('T')[0];
            
            let dayClasses = 'calendar-day';
            if (tasksForDay.length > 0) dayClasses += ' has-tasks';
            if (isToday) dayClasses += ' today';

            calendarHTML += `
                <div class="${dayClasses}" data-date="${dateString}">
                    <div class="calendar-day-number">${day}</div>
                    ${tasksForDay.length > 0 ? `<div class="calendar-task-count">${tasksForDay.length}</div>` : ''}
                    ${tasksForDay.length > 0 ? this.renderCalendarTasks(tasksForDay) : ''}
                </div>
            `;
        }

        calendarHTML += `
                </div>
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;

        // Add click listeners to calendar days
        document.querySelectorAll('.calendar-day[data-date]').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                const date = e.currentTarget.getAttribute('data-date');
                this.showTasksForDate(date);
            });
        });
    }

    renderCalendarTasks(tasks) {
        if (tasks.length === 0) return '';
        
        const maxVisible = 2;
        const visibleTasks = tasks.slice(0, maxVisible);
        const remainingCount = tasks.length - maxVisible;
        
        let tasksHTML = '<div class="calendar-tasks">';
        
        visibleTasks.forEach(task => {
            const priorityClass = `priority-${task.priority}`;
            tasksHTML += `
                <div class="calendar-task ${priorityClass}" title="${task.title}">
                    ${task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                </div>
            `;
        });
        
        if (remainingCount > 0) {
            tasksHTML += `<div class="calendar-task-more">+${remainingCount} more</div>`;
        }
        
        tasksHTML += '</div>';
        return tasksHTML;
    }

    navigateCalendar(direction) {
        const newDate = new Date(this.currentCalendarDate);
        newDate.setMonth(newDate.getMonth() + direction);
        this.currentCalendarDate = newDate;
        this.renderCalendar();
    }

    showTasksForDate(date) {
        const tasksForDate = this.tasks.filter(task => task.dueDate === date);
        
        if (tasksForDate.length === 0) {
            this.showToast(`No tasks scheduled for ${this.formatDate(date)}`, 'info');
            return;
        }

        // Show the calendar task modal with detailed task list
        this.showCalendarTaskModal(date, tasksForDate);
    }

    showCalendarTaskModal(date, tasks) {
        const modal = document.getElementById('calendarTaskModal');
        const modalTitle = document.getElementById('calendarTaskModalTitle');
        const taskDetails = document.getElementById('calendarTaskDetails');

        // Set modal title
        modalTitle.textContent = `Tasks for ${this.formatDate(date)}`;

        // Clear existing content
        taskDetails.innerHTML = '';

        // Create task items
        tasks.forEach(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            const taskElement = this.createCalendarTaskElement(task, project);
            taskDetails.appendChild(taskElement);
        });

        // Show modal
        modal.classList.add('active');
    }

    createCalendarTaskElement(task, project) {
        const taskItem = document.createElement('div');
        taskItem.className = `calendar-task-item ${task.status}`;
        
        // Add overdue class if task is overdue
        if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed') {
            taskItem.classList.add('overdue');
        }

        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const dueDateClass = isOverdue ? 'overdue' : '';

        taskItem.innerHTML = `
            <div class="calendar-task-status-indicator">
                <div class="calendar-task-status-dot ${task.status}"></div>
            </div>
            <div class="calendar-task-content">
                <div class="calendar-task-header">
                    <h4 class="calendar-task-title">${task.title}</h4>
                    <div class="calendar-task-badges">
                        <span class="calendar-task-priority-badge ${task.priority}">${task.priority}</span>
                        <span class="calendar-task-status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                    </div>
                </div>
                ${task.description ? `<p class="calendar-task-description">${task.description}</p>` : ''}
                <div class="calendar-task-meta">
                    <span class="calendar-task-project">${project ? project.name : 'No Project'}</span>
                    <div class="calendar-task-due-info">
                        <span class="due-label">Due:</span>
                        <span class="calendar-task-due-date ${dueDateClass}">
                            ${task.dueDate ? this.formatDate(task.dueDate) : 'No due date'}
                        </span>
                    </div>
                </div>
            </div>
        `;

        return taskItem;
    }

    hideCalendarTaskModal() {
        const modal = document.getElementById('calendarTaskModal');
        modal.classList.remove('active');
            const project = this.projects.find(p => p.id === task.projectId);
            return `• ${task.title} (${project ? project.name : 'Unknown Project'}) - ${task.priority} priority`;
        }).join('\n');

        alert(`Tasks for ${this.formatDate(date)}:\n\n${tasksList}`);
    }

    // Projects Rendering
    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = this.projects.map(project => {
            const projectTasks = this.tasks.filter(task => task.projectId === project.id);
            const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
            const inProgressTasks = projectTasks.filter(task => task.status === 'in-progress').length;
            const todoTasks = projectTasks.filter(task => task.status === 'todo').length;
            const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
            
            // Get overdue tasks
            const today = new Date().toISOString().split('T')[0];
            const overdueTasks = projectTasks.filter(task => 
                task.dueDate < today && task.status !== 'completed'
            ).length;
            
            // Get upcoming tasks (due within 7 days)
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            const upcomingTasks = projectTasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                const todayDate = new Date(today);
                return taskDate >= todayDate && taskDate <= nextWeek && task.status !== 'completed';
            }).length;
            
            return `
                <div class="project-card enhanced-project-card" data-project-id="${project.id}">
                    <div class="project-header">
                        <div class="project-title-section">
                            <div class="project-status-indicator ${project.status}"></div>
                            <h3 class="project-name">${project.name}</h3>
                            <button class="project-expand-btn" onclick="projectManager.toggleProjectExpansion('${project.id}')">
                                <span class="expand-icon">▼</span>
                            </button>
                        </div>
                        <div class="project-status-badge">
                            <span class="project-status ${project.status}">${this.formatStatus(project.status)}</span>
                        </div>
                    </div>
                    
                    <div class="project-summary">
                        <p class="project-description">${project.description}</p>
                        
                        <div class="project-stats-grid">
                            <div class="stat-item">
                                <span class="stat-number">${projectTasks.length}</span>
                                <span class="stat-label">Total Tasks</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${completedTasks}</span>
                                <span class="stat-label">Completed</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${inProgressTasks}</span>
                                <span class="stat-label">In Progress</span>
                            </div>
                            <div class="stat-item ${overdueTasks > 0 ? 'stat-warning' : ''}">
                                <span class="stat-number">${overdueTasks}</span>
                                <span class="stat-label">Overdue</span>
                            </div>
                        </div>
                        
                        <div class="project-timeline">
                            <div class="timeline-item">
                                <span class="timeline-label">Due Date:</span>
                                <span class="timeline-value ${this.isOverdue(project.dueDate) ? 'overdue' : ''}">${this.formatDate(project.dueDate)}</span>
                            </div>
                            ${upcomingTasks > 0 ? `
                                <div class="timeline-item upcoming">
                                    <span class="timeline-label">Upcoming:</span>
                                    <span class="timeline-value">${upcomingTasks} tasks due this week</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="project-progress">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${this.getProgressColor(progress)}" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); projectManager.editProject('${project.id}')">
                            <span class="btn-icon">✏️</span> Edit
                        </button>
                        <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); projectManager.addTaskToProject('${project.id}')">
                            <span class="btn-icon">➕</span> Add Task
                        </button>
                        <button class="btn btn--outline btn--sm btn-danger" onclick="event.stopPropagation(); projectManager.deleteProject('${project.id}')">
                            <span class="btn-icon">🗑️</span> Delete
                        </button>
                    </div>
                    
                    <!-- Expandable Task Section -->
                    <div class="project-tasks-section" id="tasks-${project.id}" style="display: none;">
                        <div class="tasks-header">
                            <h4>Project Tasks</h4>
                            <div class="task-status-filters">
                                <button class="status-filter active" data-status="all" onclick="projectManager.filterProjectTasks('${project.id}', 'all')">All</button>
                                <button class="status-filter" data-status="todo" onclick="projectManager.filterProjectTasks('${project.id}', 'todo')">To Do</button>
                                <button class="status-filter" data-status="in-progress" onclick="projectManager.filterProjectTasks('${project.id}', 'in-progress')">In Progress</button>
                                <button class="status-filter" data-status="completed" onclick="projectManager.filterProjectTasks('${project.id}', 'completed')">Completed</button>
                            </div>
                        </div>
                        <div class="project-tasks-list">
                            ${this.renderProjectTasks(projectTasks, project.id)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click listeners for project expansion
        document.querySelectorAll('.enhanced-project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.project-actions') && !e.target.closest('.project-expand-btn')) {
                    const projectId = card.getAttribute('data-project-id');
                    this.toggleProjectExpansion(projectId);
                }
            });
        });
    }

    renderProjectTasks(tasks, projectId) {
        if (tasks.length === 0) {
            return '<div class="no-tasks-message">No tasks in this project yet. <button class="btn btn--primary btn--sm" onclick="projectManager.addTaskToProject(\'' + projectId + '\')">Add First Task</button></div>';
        }

        return tasks.map(task => {
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
            const daysUntilDue = this.getDaysUntilDue(task.dueDate);
            
            return `
                <div class="project-task-item ${task.status} ${isOverdue ? 'overdue' : ''}" onclick="projectManager.editTask('${task.id}')">
                    <div class="task-status-indicator">
                        <div class="status-dot ${task.status}"></div>
                    </div>
                    <div class="task-content">
                        <div class="task-main-info">
                            <h5 class="task-title">${task.title}</h5>
                            <div class="task-badges">
                                <span class="task-priority-badge ${task.priority}">${task.priority}</span>
                                <span class="task-status-badge ${task.status}">${this.formatStatus(task.status)}</span>
                            </div>
                        </div>
                        <p class="task-description">${task.description}</p>
                        <div class="task-meta-info">
                            <div class="task-due-info">
                                <span class="due-label">Due:</span>
                                <span class="due-date ${isOverdue ? 'overdue' : ''}">${this.formatDate(task.dueDate)}</span>
                                ${daysUntilDue !== null ? `<span class="due-countdown">(${daysUntilDue})</span>` : ''}
                            </div>
                            <div class="task-team-info">
                                <span class="team-label">Assigned:</span>
                                <div class="team-avatars">
                                    ${this.renderTaskAssignees(task)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn--outline btn--xs" onclick="event.stopPropagation(); projectManager.toggleTaskStatus('${task.id}')">
                            ${task.status === 'completed' ? '↩️' : '✅'}
                        </button>
                        <button class="btn btn--outline btn--xs" onclick="event.stopPropagation(); projectManager.editTask('${task.id}')">✏️</button>
                        <button class="btn btn--outline btn--xs btn-danger" onclick="event.stopPropagation(); projectManager.deleteTask('${task.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTaskAssignees(task) {
        // For now, we'll show placeholder team members
        // In a real app, this would come from task.assignees or similar
        const assignees = ['DH', 'JS', 'AM']; // Placeholder initials
        const maxVisible = 3;
        
        return assignees.slice(0, maxVisible).map(initials => 
            `<div class="team-avatar" title="Team Member">${initials}</div>`
        ).join('') + (assignees.length > maxVisible ? 
            `<div class="team-avatar-more">+${assignees.length - maxVisible}</div>` : ''
        );
    }

    toggleProjectExpansion(projectId) {
        const tasksSection = document.getElementById(`tasks-${projectId}`);
        const expandBtn = document.querySelector(`[data-project-id="${projectId}"] .project-expand-btn .expand-icon`);
        
        if (tasksSection && expandBtn) {
            const isExpanded = tasksSection.style.display !== 'none';
            
            if (isExpanded) {
                tasksSection.style.display = 'none';
                expandBtn.textContent = '▼';
                expandBtn.style.transform = 'rotate(0deg)';
            } else {
                tasksSection.style.display = 'block';
                expandBtn.textContent = '▲';
                expandBtn.style.transform = 'rotate(180deg)';
            }
        }
    }

    filterProjectTasks(projectId, status) {
        const tasksSection = document.getElementById(`tasks-${projectId}`);
        if (!tasksSection) return;

        // Update filter buttons
        const filterButtons = tasksSection.querySelectorAll('.status-filter');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-status') === status) {
                btn.classList.add('active');
            }
        });

        // Filter tasks
        const taskItems = tasksSection.querySelectorAll('.project-task-item');
        taskItems.forEach(item => {
            if (status === 'all') {
                item.style.display = 'flex';
            } else {
                const hasStatus = item.classList.contains(status);
                item.style.display = hasStatus ? 'flex' : 'none';
            }
        });
    }

    addTaskToProject(projectId) {
        this.openTaskModal();
        // Pre-select the project
        setTimeout(() => {
            const projectSelect = document.getElementById('taskProject');
            if (projectSelect) {
                projectSelect.value = projectId;
            }
        }, 100);
    }

    // Utility functions
    formatStatus(status) {
        const statusMap = {
            'active': 'Active',
            'completed': 'Completed',
            'on-hold': 'On Hold',
            'todo': 'To Do',
            'in-progress': 'In Progress'
        };
        return statusMap[status] || status;
    }

    getProgressColor(progress) {
        if (progress >= 80) return 'progress-excellent';
        if (progress >= 60) return 'progress-good';
        if (progress >= 40) return 'progress-fair';
        return 'progress-poor';
    }

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date().setHours(0, 0, 0, 0);
    }

    getDaysUntilDue(dueDate) {
        const today = new Date().setHours(0, 0, 0, 0);
        const due = new Date(dueDate).setHours(0, 0, 0, 0);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays <= 7) return `${diffDays} days left`;
        return null;
    }

    // Tasks Rendering
    renderTasks() {
        if (this.currentTaskView === 'kanban') {
            this.renderKanban();
        } else {
            this.renderTaskList();
        }
    }

    renderTaskList() {
        const tasksContainer = document.getElementById('tasksContainer');
        if (!tasksContainer) return;

        const filteredTasks = this.getFilteredTasks();
        
        tasksContainer.innerHTML = filteredTasks.map(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
            
            return `
                <div class="task-item ${task.status}" onclick="projectManager.editTask('${task.id}')">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    <p class="task-description">${task.description}</p>
                    <div class="task-meta">
                        <span class="task-project">${project ? project.name : 'Unknown Project'}</span>
                        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            Due: ${this.formatDate(task.dueDate)}
                        </span>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn--outline btn-icon" onclick="event.stopPropagation(); projectManager.toggleTaskStatus('${task.id}')">
                            ${task.status === 'completed' ? '↩️' : '✅'}
                        </button>
                        <button class="btn btn--outline btn-icon" onclick="event.stopPropagation(); projectManager.editTask('${task.id}')">✏️</button>
                        <button class="btn btn--outline btn-icon" onclick="event.stopPropagation(); projectManager.deleteTask('${task.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderKanban() {
        const todoColumn = document.getElementById('todoColumn');
        const inProgressColumn = document.getElementById('inProgressColumn');
        const completedColumn = document.getElementById('completedColumn');
        
        if (!todoColumn || !inProgressColumn || !completedColumn) return;

        const filteredTasks = this.getFilteredTasks();
        
        const todoTasks = filteredTasks.filter(task => task.status === 'todo');
        const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
        const completedTasks = filteredTasks.filter(task => task.status === 'completed');
        
        todoColumn.innerHTML = this.renderKanbanTasks(todoTasks);
        inProgressColumn.innerHTML = this.renderKanbanTasks(inProgressTasks);
        completedColumn.innerHTML = this.renderKanbanTasks(completedTasks);
    }

    renderKanbanTasks(tasks) {
        return tasks.map(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            return `
                <div class="kanban-task" onclick="projectManager.editTask('${task.id}')">
                    <div class="kanban-task-title">${task.title}</div>
                    <div class="kanban-task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span>${project ? project.name : 'Unknown'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        const filterProject = document.getElementById('filterProject');
        const filterPriority = document.getElementById('filterPriority');
        const filterStatus = document.getElementById('filterStatus');
        
        const projectFilter = filterProject ? filterProject.value : '';
        const priorityFilter = filterPriority ? filterPriority.value : '';
        const statusFilter = filterStatus ? filterStatus.value : '';
        
        if (projectFilter) {
            filteredTasks = filteredTasks.filter(task => task.projectId === projectFilter);
        }
        
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }
        
        return filteredTasks;
    }

    populateProjectFilters() {
        const filterProject = document.getElementById('filterProject');
        const taskProject = document.getElementById('taskProject');
        
        const projectOptions = this.projects.map(project => 
            `<option value="${project.id}">${project.name}</option>`
        ).join('');
        
        if (filterProject) {
            filterProject.innerHTML = '<option value="">All Projects</option>' + projectOptions;
        }
        if (taskProject) {
            taskProject.innerHTML = '<option value="">Select Project</option>' + projectOptions;
        }
    }

    // Search functionality
    handleGlobalSearch(query) {
        if (!query.trim()) {
            if (this.currentView === 'tasks') {
                this.renderTasks();
            }
            return;
        }
        
        if (this.currentView === 'tasks') {
            const searchResults = this.tasks.filter(task => 
                task.title.toLowerCase().includes(query.toLowerCase()) ||
                task.description.toLowerCase().includes(query.toLowerCase())
            );
            this.renderSearchResults(searchResults);
        }
    }

    renderSearchResults(tasks) {
        const tasksContainer = document.getElementById('tasksContainer');
        if (!tasksContainer) return;
        
        tasksContainer.innerHTML = tasks.map(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
            
            return `
                <div class="task-item ${task.status}" onclick="projectManager.editTask('${task.id}')">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    <p class="task-description">${task.description}</p>
                    <div class="task-meta">
                        <span class="task-project">${project ? project.name : 'Unknown Project'}</span>
                        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            Due: ${this.formatDate(task.dueDate)}
                        </span>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn--outline btn-icon" onclick="event.stopPropagation(); projectManager.toggleTaskStatus('${task.id}')">
                            ${task.status === 'completed' ? '↩️' : '✅'}
                        </button>
                        <button class="btn btn--outline btn-icon" onclick="event.stopPropagation(); projectManager.editTask('${task.id}')">✏️</button>
                        <button class="btn btn--outline btn-icon" onclick="event.stopPropagation(); projectManager.deleteTask('${task.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Project Management
    openProjectModal(projectId = null) {
        this.currentEditingProject = projectId;
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        
        if (!modal || !title) return;
        
        if (projectId) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                title.textContent = 'Edit Project';
                const nameField = document.getElementById('projectName');
                const descField = document.getElementById('projectDescription');
                const statusField = document.getElementById('projectStatus');
                const dueDateField = document.getElementById('projectDueDate');
                
                if (nameField) nameField.value = project.name;
                if (descField) descField.value = project.description;
                if (statusField) statusField.value = project.status;
                if (dueDateField) dueDateField.value = project.dueDate;
            }
        } else {
            title.textContent = 'Add Project';
            const form = document.getElementById('projectForm');
            if (form) form.reset();
        }
        
        modal.classList.add('active');
    }

    closeProjectModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditingProject = null;
        const form = document.getElementById('projectForm');
        if (form) form.reset();
    }

    async saveProject() {
        const nameField = document.getElementById('projectName');
        const descField = document.getElementById('projectDescription');
        const statusField = document.getElementById('projectStatus');
        const dueDateField = document.getElementById('projectDueDate');
        
        if (!nameField || !descField || !statusField || !dueDateField) return;
        
        const name = nameField.value;
        const description = descField.value;
        const status = statusField.value;
        const dueDate = dueDateField.value;
        
        if (!name.trim()) {
            this.showToast('Project name is required', 'error');
            return;
        }
        
        try {
            if (this.currentEditingProject) {
                // Edit existing project
                const existingProject = this.projects.find(p => p.id === this.currentEditingProject);
                if (existingProject) {
                    const updatedProject = {
                        ...existingProject,
                        name,
                        description,
                        status,
                        dueDate
                    };
                    
                    await projectFlowDB.updateProject(updatedProject);
                    
                    // Update local array
                    const projectIndex = this.projects.findIndex(p => p.id === this.currentEditingProject);
                    this.projects[projectIndex] = updatedProject;
                    
                    this.showToast('Project updated successfully', 'success');
                }
            } else {
                // Create new project
                const newProject = {
                    id: `proj-${Date.now()}`,
                    name,
                    description,
                    status,
                    dueDate,
                    createdDate: new Date().toISOString().split('T')[0]
                };
                
                await projectFlowDB.addProject(newProject);
                this.projects.push(newProject);
                this.showToast('Project created successfully', 'success');
            }
            
            this.closeProjectModal();
            this.renderProjects();
            this.renderDashboard();
            
        } catch (error) {
            console.error('Failed to save project:', error);
            this.showToast('Failed to save project', 'error');
        }
    }

    editProject(projectId) {
        this.openProjectModal(projectId);
    }

    async deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
            try {
                // Delete project and associated tasks from IndexedDB
                await projectFlowDB.deleteProject(projectId);
                const deletedTasksCount = await projectFlowDB.deleteTasksByProject(projectId);
                
                // Update local arrays
                this.projects = this.projects.filter(p => p.id !== projectId);
                this.tasks = this.tasks.filter(t => t.projectId !== projectId);
                
                this.renderProjects();
                this.renderDashboard();
                this.showToast(`Project and ${deletedTasksCount} associated tasks deleted successfully`, 'success');
                
            } catch (error) {
                console.error('Failed to delete project:', error);
                this.showToast('Failed to delete project', 'error');
            }
        }
    }

    // Task Management
    openTaskModal(taskId = null) {
        this.currentEditingTask = taskId;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        
        if (!modal || !title) return;
        
        this.populateProjectFilters();
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Edit Task';
                const titleField = document.getElementById('taskTitle');
                const descField = document.getElementById('taskDescription');
                const projectField = document.getElementById('taskProject');
                const priorityField = document.getElementById('taskPriority');
                const statusField = document.getElementById('taskStatus');
                const dueDateField = document.getElementById('taskDueDate');
                
                if (titleField) titleField.value = task.title;
                if (descField) descField.value = task.description;
                if (projectField) projectField.value = task.projectId;
                if (priorityField) priorityField.value = task.priority;
                if (statusField) statusField.value = task.status;
                if (dueDateField) dueDateField.value = task.dueDate;
            }
        } else {
            title.textContent = 'Add Task';
            const form = document.getElementById('taskForm');
            if (form) form.reset();
        }
        
        modal.classList.add('active');
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditingTask = null;
        const form = document.getElementById('taskForm');
        if (form) form.reset();
    }

    async saveTask() {
        const titleField = document.getElementById('taskTitle');
        const descField = document.getElementById('taskDescription');
        const projectField = document.getElementById('taskProject');
        const priorityField = document.getElementById('taskPriority');
        const statusField = document.getElementById('taskStatus');
        const dueDateField = document.getElementById('taskDueDate');
        
        if (!titleField || !descField || !projectField || !priorityField || !statusField || !dueDateField) return;
        
        const title = titleField.value;
        const description = descField.value;
        const projectId = projectField.value;
        const priority = priorityField.value;
        const status = statusField.value;
        const dueDate = dueDateField.value;
        
        if (!title.trim()) {
            this.showToast('Task title is required', 'error');
            return;
        }
        
        if (!projectId) {
            this.showToast('Please select a project', 'error');
            return;
        }
        
        try {
            if (this.currentEditingTask) {
                // Edit existing task
                const existingTask = this.tasks.find(t => t.id === this.currentEditingTask);
                if (existingTask) {
                    const updatedTask = {
                        ...existingTask,
                        title,
                        description,
                        projectId,
                        priority,
                        status,
                        dueDate
                    };
                    
                    await projectFlowDB.updateTask(updatedTask);
                    
                    // Update local array
                    const taskIndex = this.tasks.findIndex(t => t.id === this.currentEditingTask);
                    this.tasks[taskIndex] = updatedTask;
                    
                    this.showToast('Task updated successfully', 'success');
                }
            } else {
                // Create new task
                const newTask = {
                    id: `task-${Date.now()}`,
                    title,
                    description,
                    projectId,
                    priority,
                    status,
                    dueDate,
                    createdDate: new Date().toISOString().split('T')[0]
                };
                
                await projectFlowDB.addTask(newTask);
                this.tasks.push(newTask);
                this.showToast('Task created successfully', 'success');
            }
            
            this.closeTaskModal();
            this.renderTasks();
            this.renderDashboard();
            
        } catch (error) {
            console.error('Failed to save task:', error);
            this.showToast('Failed to save task', 'error');
        }
    }

    editTask(taskId) {
        this.openTaskModal(taskId);
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await projectFlowDB.deleteTask(taskId);
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                
                this.renderTasks();
                this.renderDashboard();
                this.showToast('Task deleted successfully', 'success');
                
            } catch (error) {
                console.error('Failed to delete task:', error);
                this.showToast('Failed to delete task', 'error');
            }
        }
    }

    async toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            try {
                if (task.status === 'completed') {
                    task.status = 'todo';
                } else {
                    task.status = 'completed';
                }
                
                await projectFlowDB.updateTask(task);
                
                this.renderTasks();
                this.renderDashboard();
                this.showToast(`Task marked as ${task.status}`, 'success');
                
            } catch (error) {
                console.error('Failed to update task status:', error);
                this.showToast('Failed to update task status', 'error');
            }
        }
    }

    // Utility functions
    formatDate(dateString) {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const projectManager = new ProjectManager();