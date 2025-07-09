// ProjectFlow - Project Management Application
class ProjectManager {
    constructor() {
        this.projects = [];
        this.tasks = [];
        this.currentView = 'dashboard';
        this.currentDate = new Date();
        this.editingProject = null;
        this.editingTask = null;
        this.currentTheme = this.getStoredTheme();
        
        this.init();
    }

    async init() {
        try {
            // Initialize database
            await projectFlowDB.openDatabase();
            
            // Load data from IndexedDB
            await this.loadData();
            
            // Initialize UI
            this.initializeEventListeners();
            this.applyTheme();
            this.renderDashboard();
            this.renderCalendar();
            
            console.log('ProjectFlow initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ProjectFlow:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }

    async loadData() {
        try {
            // Try to load from IndexedDB first
            const [projects, tasks] = await Promise.all([
                projectFlowDB.getAllProjects(),
                projectFlowDB.getAllTasks()
            ]);

            if (projects.length === 0 && tasks.length === 0) {
                // Check if we need to migrate from localStorage
                await this.migrateFromLocalStorage();
                
                // If still no data, load sample data
                const [newProjects, newTasks] = await Promise.all([
                    projectFlowDB.getAllProjects(),
                    projectFlowDB.getAllTasks()
                ]);
                
                if (newProjects.length === 0 && newTasks.length === 0) {
                    await this.loadSampleData();
                }
            }

            // Load the final data
            this.projects = await projectFlowDB.getAllProjects();
            this.tasks = await projectFlowDB.getAllTasks();
            
            console.log(`Loaded ${this.projects.length} projects and ${this.tasks.length} tasks`);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    async migrateFromLocalStorage() {
        try {
            const localProjects = localStorage.getItem('projectflow_projects');
            const localTasks = localStorage.getItem('projectflow_tasks');

            if (localProjects || localTasks) {
                console.log('Migrating data from localStorage to IndexedDB...');
                
                if (localProjects) {
                    const projects = JSON.parse(localProjects);
                    await projectFlowDB.bulkAddProjects(projects);
                    console.log(`Migrated ${projects.length} projects`);
                }

                if (localTasks) {
                    const tasks = JSON.parse(localTasks);
                    await projectFlowDB.bulkAddTasks(tasks);
                    console.log(`Migrated ${tasks.length} tasks`);
                }

                // Clean up localStorage after successful migration
                localStorage.removeItem('projectflow_projects');
                localStorage.removeItem('projectflow_tasks');
                
                this.showToast('Data migrated successfully to IndexedDB', 'success');
            }
        } catch (error) {
            console.error('Error migrating from localStorage:', error);
            this.showToast('Error migrating data', 'warning');
        }
    }

    async loadSampleData() {
        try {
            console.log('Loading sample data...');
            
            const sampleProjects = [
                {
                    id: 'proj-1',
                    name: 'Website Redesign',
                    description: 'Complete overhaul of company website with modern design and improved user experience',
                    status: 'active',
                    dueDate: '2025-07-15',
                    createdDate: '2025-06-01'
                },
                {
                    id: 'proj-2',
                    name: 'Mobile App Development',
                    description: 'Develop cross-platform mobile application for iOS and Android',
                    status: 'active',
                    dueDate: '2025-08-30',
                    createdDate: '2025-06-15'
                },
                {
                    id: 'proj-3',
                    name: 'Marketing Campaign',
                    description: 'Q3 marketing campaign for product launch',
                    status: 'completed',
                    dueDate: '2025-06-30',
                    createdDate: '2025-05-01'
                }
            ];

            const sampleTasks = [
                {
                    id: 'task-1',
                    title: 'Create wireframes',
                    description: 'Design wireframes for all main pages',
                    projectId: 'proj-1',
                    priority: 'high',
                    status: 'completed',
                    dueDate: '2025-06-15',
                    createdDate: '2025-06-01'
                },
                {
                    id: 'task-2',
                    title: 'Develop homepage',
                    description: 'Code the new homepage with responsive design',
                    projectId: 'proj-1',
                    priority: 'high',
                    status: 'in-progress',
                    dueDate: '2025-07-01',
                    createdDate: '2025-06-10'
                },
                {
                    id: 'task-3',
                    title: 'User testing',
                    description: 'Conduct user testing sessions',
                    projectId: 'proj-1',
                    priority: 'medium',
                    status: 'todo',
                    dueDate: '2025-07-10',
                    createdDate: '2025-06-20'
                },
                {
                    id: 'task-4',
                    title: 'API Development',
                    description: 'Build REST API for mobile app',
                    projectId: 'proj-2',
                    priority: 'high',
                    status: 'in-progress',
                    dueDate: '2025-07-20',
                    createdDate: '2025-06-15'
                },
                {
                    id: 'task-5',
                    title: 'UI Design',
                    description: 'Create UI mockups for mobile app',
                    projectId: 'proj-2',
                    priority: 'medium',
                    status: 'todo',
                    dueDate: '2025-07-25',
                    createdDate: '2025-06-18'
                },
                {
                    id: 'task-6',
                    title: 'Social Media Content',
                    description: 'Create content for social media campaign',
                    projectId: 'proj-3',
                    priority: 'low',
                    status: 'completed',
                    dueDate: '2025-06-25',
                    createdDate: '2025-05-15'
                }
            ];

            await projectFlowDB.bulkAddProjects(sampleProjects);
            await projectFlowDB.bulkAddTasks(sampleTasks);
            
            console.log('Sample data loaded successfully');
            this.showToast('Sample data loaded', 'info');
        } catch (error) {
            console.error('Error loading sample data:', error);
            this.showToast('Error loading sample data', 'error');
        }
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Project modal
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });
        
        document.getElementById('quickAddProject').addEventListener('click', () => {
            this.openProjectModal();
        });

        document.getElementById('closeProjectModal').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('cancelProjectModal').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('saveProject').addEventListener('click', () => {
            this.saveProject();
        });

        // Task modal
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });
        
        document.getElementById('quickAddTask').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('closeTaskModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancelTaskModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('saveTask').addEventListener('click', () => {
            this.saveTask();
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

        // Modal overlay clicks
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeProjectModal();
            }
        });

        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeTaskModal();
            }
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

    renderDashboard() {
        // Update statistics
        const totalProjects = this.projects.length;
        const activeTasks = this.tasks.filter(task => task.status !== 'completed').length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const tasksDueToday = this.getTasksDueToday().length;

        document.getElementById('totalProjects').textContent = totalProjects;
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('tasksDueToday').textContent = tasksDueToday;

        // Render activity feed
        this.renderActivityFeed();
    }

    renderActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        
        // Generate recent activities based on tasks and projects
        const activities = [];
        
        // Recent task completions
        const recentCompletedTasks = this.tasks
            .filter(task => task.status === 'completed')
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 3);
            
        recentCompletedTasks.forEach(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            activities.push({
                text: `Completed task "${task.title}" in ${project?.name || 'Unknown Project'}`,
                time: this.formatRelativeTime(task.createdDate),
                type: 'success'
            });
        });

        // Recent project updates
        const recentProjects = this.projects
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 2);
            
        recentProjects.forEach(project => {
            activities.push({
                text: `Created project "${project.name}"`,
                time: this.formatRelativeTime(project.createdDate),
                type: 'info'
            });
        });

        // Sort activities by time and limit to 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const limitedActivities = activities.slice(0, 5);

        if (limitedActivities.length === 0) {
            activityFeed.innerHTML = '<div class="activity-item"><div class="activity-text">No recent activity</div></div>';
            return;
        }

        activityFeed.innerHTML = limitedActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    renderCalendar() {
        const container = document.getElementById('calendarContainer');
        const monthYear = document.getElementById('calendarMonthYear');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Create calendar grid
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
            const currentDate = new Date(year, month, day);
            const dateString = this.formatDate(currentDate);
            const isToday = this.isToday(currentDate);
            const tasksForDay = this.getTasksForDate(dateString);
            const hasTasksClass = tasksForDay.length > 0 ? 'has-tasks' : '';
            const todayClass = isToday ? 'today' : '';

            calendarHTML += `
                <div class="calendar-day ${hasTasksClass} ${todayClass}" data-date="${dateString}">
                    <div class="calendar-day-number">${day}</div>
                    ${tasksForDay.length > 0 ? `<div class="calendar-task-count">${tasksForDay.length}</div>` : ''}
                    <div class="calendar-tasks">
                        ${tasksForDay.slice(0, 2).map(task => `
                            <div class="calendar-task priority-${task.priority}" title="${task.title}">
                                ${task.title}
                            </div>
                        `).join('')}
                        ${tasksForDay.length > 2 ? `<div class="calendar-task-more">+${tasksForDay.length - 2} more</div>` : ''}
                    </div>
                </div>
            `;
        }

        calendarHTML += '</div></div>';
        container.innerHTML = calendarHTML;

        // Add click event listeners to calendar days
        this.addCalendarClickListeners();
    }

    addCalendarClickListeners() {
        const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');
        
        calendarDays.forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                const dateString = dayElement.dataset.date;
                if (dateString) {
                    this.displayTasksForDate(dateString);
                }
            });
        });
    }

    displayTasksForDate(dateString) {
        const tasksForDay = this.getTasksForDate(dateString);
        const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (tasksForDay.length === 0) {
            this.showToast(`No tasks scheduled for ${formattedDate}`, 'info');
            return;
        }

        // Group tasks by priority for better organization
        const tasksByPriority = {
            high: tasksForDay.filter(task => task.priority === 'high'),
            medium: tasksForDay.filter(task => task.priority === 'medium'),
            low: tasksForDay.filter(task => task.priority === 'low')
        };

        let message = `Tasks for ${formattedDate}:\n\n`;

        // Add high priority tasks first
        if (tasksByPriority.high.length > 0) {
            message += `🔴 High Priority (${tasksByPriority.high.length}):\n`;
            tasksByPriority.high.forEach(task => {
                const project = this.projects.find(p => p.id === task.projectId);
                const statusIcon = this.getStatusIcon(task.status);
                message += `${statusIcon} ${task.title} (${project?.name || 'No Project'})\n`;
            });
            message += '\n';
        }

        // Add medium priority tasks
        if (tasksByPriority.medium.length > 0) {
            message += `🟡 Medium Priority (${tasksByPriority.medium.length}):\n`;
            tasksByPriority.medium.forEach(task => {
                const project = this.projects.find(p => p.id === task.projectId);
                const statusIcon = this.getStatusIcon(task.status);
                message += `${statusIcon} ${task.title} (${project?.name || 'No Project'})\n`;
            });
            message += '\n';
        }

        // Add low priority tasks
        if (tasksByPriority.low.length > 0) {
            message += `🔵 Low Priority (${tasksByPriority.low.length}):\n`;
            tasksByPriority.low.forEach(task => {
                const project = this.projects.find(p => p.id === task.projectId);
                const statusIcon = this.getStatusIcon(task.status);
                message += `${statusIcon} ${task.title} (${project?.name || 'No Project'})\n`;
            });
        }

        // Determine toast type based on task priorities
        let toastType = 'info';
        if (tasksByPriority.high.length > 0) {
            toastType = 'warning'; // High priority tasks warrant attention
        } else if (tasksByPriority.medium.length > 0) {
            toastType = 'info';
        }

        this.showToast(message, toastType);
    }

    getStatusIcon(status) {
        switch (status) {
            case 'completed':
                return '✅';
            case 'in-progress':
                return '🔄';
            case 'todo':
            default:
                return '⏳';
        }
    }

    getTasksForDate(dateString) {
        return this.tasks.filter(task => task.dueDate === dateString);
    }

    getTasksDueToday() {
        const today = this.formatDate(new Date());
        return this.getTasksForDate(today);
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    }

    renderProjects() {
        const container = document.getElementById('projectsGrid');
        
        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No projects yet</h3>
                    <p>Create your first project to get started</p>
                    <button class="btn btn--primary" onclick="projectManager.openProjectModal()">Create Project</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.projects.map(project => {
            const projectTasks = this.tasks.filter(task => task.projectId === project.id);
            const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
            const totalTasks = projectTasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const overdueTasks = projectTasks.filter(task => 
                task.status !== 'completed' && 
                task.dueDate && 
                new Date(task.dueDate) < new Date()
            ).length;

            const dueDate = project.dueDate ? new Date(project.dueDate) : null;
            const isOverdue = dueDate && dueDate < new Date() && project.status !== 'completed';
            const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

            let progressClass = 'progress-poor';
            if (progress >= 80) progressClass = 'progress-excellent';
            else if (progress >= 60) progressClass = 'progress-good';
            else if (progress >= 30) progressClass = 'progress-fair';

            return `
                <div class="enhanced-project-card" onclick="projectManager.editProject('${project.id}')">
                    <div class="project-header">
                        <div class="project-title-section">
                            <div class="project-status-indicator ${project.status}"></div>
                            <h3 class="project-name">${project.name}</h3>
                        </div>
                        <div class="project-status-badge">
                            <span class="project-status ${project.status}">${project.status.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div class="project-summary">
                        <p class="project-description">${project.description || 'No description provided'}</p>
                        
                        <div class="project-stats-grid">
                            <div class="stat-item">
                                <span class="stat-number">${totalTasks}</span>
                                <span class="stat-label">Total Tasks</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${completedTasks}</span>
                                <span class="stat-label">Completed</span>
                            </div>
                            <div class="stat-item ${overdueTasks > 0 ? 'stat-warning' : ''}">
                                <span class="stat-number">${overdueTasks}</span>
                                <span class="stat-label">Overdue</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${progress}%</span>
                                <span class="stat-label">Progress</span>
                            </div>
                        </div>

                        <div class="project-progress">
                            <div class="progress-label">
                                <span>Progress</span>
                                <span>${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                            </div>
                        </div>

                        <div class="project-timeline">
                            <div class="timeline-item">
                                <span class="timeline-label">Created:</span>
                                <span class="timeline-value">${new Date(project.createdDate).toLocaleDateString()}</span>
                            </div>
                            ${project.dueDate ? `
                                <div class="timeline-item ${isOverdue ? 'upcoming' : ''}">
                                    <span class="timeline-label">Due:</span>
                                    <span class="timeline-value ${isOverdue ? 'overdue' : ''}">${new Date(project.dueDate).toLocaleDateString()}</span>
                                    ${daysUntilDue !== null ? `<span class="timeline-value">(${daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`})</span>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="project-actions">
                        <button class="btn btn--outline btn--xs" onclick="event.stopPropagation(); projectManager.editProject('${project.id}')">
                            <span class="btn-icon">✏️</span>Edit
                        </button>
                        <button class="btn btn--outline btn--xs btn-danger" onclick="event.stopPropagation(); projectManager.deleteProject('${project.id}')">
                            <span class="btn-icon">🗑️</span>Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        let filteredTasks = [...this.tasks];

        // Apply filters
        const projectFilter = document.getElementById('filterProject').value;
        const priorityFilter = document.getElementById('filterPriority').value;
        const statusFilter = document.getElementById('filterStatus').value;

        if (projectFilter) {
            filteredTasks = filteredTasks.filter(task => task.projectId === projectFilter);
        }
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Create a new task or adjust your filters</p>
                    <button class="btn btn--primary" onclick="projectManager.openTaskModal()">Create Task</button>
                </div>
            `;
            return;
        }

        // Sort tasks by due date and priority
        filteredTasks.sort((a, b) => {
            // First sort by due date
            if (a.dueDate && b.dueDate) {
                const dateComparison = new Date(a.dueDate) - new Date(b.dueDate);
                if (dateComparison !== 0) return dateComparison;
            } else if (a.dueDate) return -1;
            else if (b.dueDate) return 1;

            // Then by priority
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        container.innerHTML = filteredTasks.map(task => {
            const project = this.projects.find(p => p.id === task.projectId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
            
            return `
                <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" onclick="projectManager.editTask('${task.id}')">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    
                    <p class="task-description">${task.description || 'No description'}</p>
                    
                    <div class="task-meta">
                        <div>
                            <span class="task-project">${project?.name || 'No Project'}</span>
                            ${task.dueDate ? `
                                <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                    Due: ${new Date(task.dueDate).toLocaleDateString()}
                                    ${isOverdue ? ' (Overdue)' : ''}
                                </span>
                            ` : ''}
                        </div>
                        <span class="status status--${this.getStatusClass(task.status)}">${task.status.replace('-', ' ')}</span>
                    </div>
                    
                    <div class="task-actions">
                        <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); projectManager.toggleTaskStatus('${task.id}')">
                            ${task.status === 'completed' ? 'Reopen' : 'Complete'}
                        </button>
                        <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); projectManager.editTask('${task.id}')">Edit</button>
                        <button class="btn btn--outline btn--sm btn-danger" onclick="event.stopPropagation(); projectManager.deleteTask('${task.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderKanban() {
        const todoColumn = document.getElementById('todoColumn');
        const inProgressColumn = document.getElementById('inProgressColumn');
        const completedColumn = document.getElementById('completedColumn');

        const todoTasks = this.tasks.filter(task => task.status === 'todo');
        const inProgressTasks = this.tasks.filter(task => task.status === 'in-progress');
        const completedTasks = this.tasks.filter(task => task.status === 'completed');

        const renderKanbanTasks = (tasks) => {
            return tasks.map(task => {
                const project = this.projects.find(p => p.id === task.projectId);
                return `
                    <div class="kanban-task priority-${task.priority}" onclick="projectManager.editTask('${task.id}')">
                        <div class="kanban-task-title">${task.title}</div>
                        <div class="kanban-task-meta">
                            <span class="task-priority ${task.priority}">${task.priority}</span>
                            <span class="task-project">${project?.name || 'No Project'}</span>
                        </div>
                    </div>
                `;
            }).join('');
        };

        todoColumn.innerHTML = renderKanbanTasks(todoTasks);
        inProgressColumn.innerHTML = renderKanbanTasks(inProgressTasks);
        completedColumn.innerHTML = renderKanbanTasks(completedTasks);
    }

    populateTaskProjectFilter() {
        const select = document.getElementById('filterProject');
        const taskProjectSelect = document.getElementById('taskProject');
        
        const projectOptions = this.projects.map(project => 
            `<option value="${project.id}">${project.name}</option>`
        ).join('');

        select.innerHTML = '<option value="">All Projects</option>' + projectOptions;
        taskProjectSelect.innerHTML = '<option value="">Select Project</option>' + projectOptions;
    }

    // Project CRUD operations
    openProjectModal(projectId = null) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const form = document.getElementById('projectForm');

        if (projectId) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                title.textContent = 'Edit Project';
                document.getElementById('projectName').value = project.name;
                document.getElementById('projectDescription').value = project.description || '';
                document.getElementById('projectStatus').value = project.status;
                document.getElementById('projectDueDate').value = project.dueDate || '';
                this.editingProject = projectId;
            }
        } else {
            title.textContent = 'Add Project';
            form.reset();
            this.editingProject = null;
        }

        modal.classList.add('active');
    }

    closeProjectModal() {
        document.getElementById('projectModal').classList.remove('active');
        document.getElementById('projectForm').reset();
        this.editingProject = null;
    }

    async saveProject() {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const status = document.getElementById('projectStatus').value;
        const dueDate = document.getElementById('projectDueDate').value;

        if (!name) {
            this.showToast('Project name is required', 'error');
            return;
        }

        try {
            const projectData = {
                name,
                description,
                status,
                dueDate: dueDate || null
            };

            if (this.editingProject) {
                // Update existing project
                const existingProject = this.projects.find(p => p.id === this.editingProject);
                const updatedProject = { ...existingProject, ...projectData };
                
                await projectFlowDB.updateProject(updatedProject);
                
                const index = this.projects.findIndex(p => p.id === this.editingProject);
                this.projects[index] = updatedProject;
                
                this.showToast('Project updated successfully', 'success');
            } else {
                // Create new project
                const newProject = {
                    id: 'proj-' + Date.now(),
                    ...projectData,
                    createdDate: new Date().toISOString().split('T')[0]
                };

                await projectFlowDB.addProject(newProject);
                this.projects.push(newProject);
                
                this.showToast('Project created successfully', 'success');
            }

            this.closeProjectModal();
            this.renderProjects();
            this.renderDashboard();
            this.populateTaskProjectFilter();
        } catch (error) {
            console.error('Error saving project:', error);
            this.showToast('Error saving project', 'error');
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

            this.showToast('Project deleted successfully', 'success');
            this.renderProjects();
            this.renderDashboard();
            this.populateTaskProjectFilter();
        } catch (error) {
            console.error('Error deleting project:', error);
            this.showToast('Error deleting project', 'error');
        }
    }

    // Task CRUD operations
    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const form = document.getElementById('taskForm');

        // Populate project dropdown
        this.populateTaskProjectFilter();

        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Edit Task';
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskProject').value = task.projectId;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskStatus').value = task.status;
                document.getElementById('taskDueDate').value = task.dueDate || '';
                this.editingTask = taskId;
            }
        } else {
            title.textContent = 'Add Task';
            form.reset();
            this.editingTask = null;
        }

        modal.classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        document.getElementById('taskForm').reset();
        this.editingTask = null;
    }

    async saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const projectId = document.getElementById('taskProject').value;
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            this.showToast('Task title is required', 'error');
            return;
        }

        if (!projectId) {
            this.showToast('Please select a project', 'error');
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

            if (this.editingTask) {
                // Update existing task
                const existingTask = this.tasks.find(t => t.id === this.editingTask);
                const updatedTask = { ...existingTask, ...taskData };
                
                await projectFlowDB.updateTask(updatedTask);
                
                const index = this.tasks.findIndex(t => t.id === this.editingTask);
                this.tasks[index] = updatedTask;
                
                this.showToast('Task updated successfully', 'success');
            } else {
                // Create new task
                const newTask = {
                    id: 'task-' + Date.now(),
                    ...taskData,
                    createdDate: new Date().toISOString().split('T')[0]
                };

                await projectFlowDB.addTask(newTask);
                this.tasks.push(newTask);
                
                this.showToast('Task created successfully', 'success');
            }

            this.closeTaskModal();
            this.renderTasks();
            this.renderDashboard();
            this.renderCalendar();
        } catch (error) {
            console.error('Error saving task:', error);
            this.showToast('Error saving task', 'error');
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

            this.showToast('Task deleted successfully', 'success');
            this.renderTasks();
            this.renderDashboard();
            this.renderCalendar();
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showToast('Error deleting task', 'error');
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

            this.showToast(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`, 'success');
            this.renderTasks();
            this.renderDashboard();
            this.renderCalendar();
        } catch (error) {
            console.error('Error toggling task status:', error);
            this.showToast('Error updating task status', 'error');
        }
    }

    // Utility functions
    getStatusClass(status) {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'warning';
            case 'todo': return 'info';
            default: return 'info';
        }
    }

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

    // Theme management
    getStoredTheme() {
        return localStorage.getItem('projectflow_theme') || 'auto';
    }

    setStoredTheme(theme) {
        localStorage.setItem('projectflow_theme', theme);
    }

    getPreferredTheme() {
        const storedTheme = this.getStoredTheme();
        if (storedTheme !== 'auto') {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme() {
        const theme = this.getPreferredTheme();
        document.documentElement.setAttribute('data-color-scheme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        const currentTheme = this.getPreferredTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setStoredTheme(newTheme);
        this.currentTheme = newTheme;
        this.applyTheme();
        
        this.showToast(`Switched to ${newTheme} theme`, 'info');
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Format message for better display in toast
        const formattedMessage = message.replace(/\n/g, '<br>');
        toast.innerHTML = `
            <div style="white-space: pre-line; line-height: 1.4;">${formattedMessage}</div>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after delay (longer for task lists)
        const delay = message.includes('Tasks for') ? 8000 : 3000;
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, delay);
    }
}

// Initialize the application
const projectManager = new ProjectManager();

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (projectManager.currentTheme === 'auto') {
        projectManager.applyTheme();
    }
});