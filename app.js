// ProjectFlow - Project Management Application
class ProjectManager {
    constructor() {
        this.db = projectFlowDB;
        this.currentView = 'dashboard';
        this.currentProject = null;
        this.currentTask = null;
        this.currentDate = new Date();
        this.currentTheme = this.getStoredTheme();
        this.init();
    }

    async init() {
        try {
            await this.db.openDatabase();
            await this.migrateFromLocalStorage();
            await this.loadSampleDataIfNeeded();
            this.setupEventListeners();
            this.applyTheme();
            this.showView('dashboard');
            await this.refreshAllViews();
        } catch (error) {
            console.error('Failed to initialize ProjectFlow:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }

    // Theme management
    getStoredTheme() {
        const stored = localStorage.getItem('projectflow-theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('projectflow-theme', this.currentTheme);
        this.applyTheme();
    }

    // Data migration from localStorage to IndexedDB
    async migrateFromLocalStorage() {
        try {
            // Check if we already have data in IndexedDB
            const existingProjects = await this.db.getAllProjects();
            if (existingProjects.length > 0) {
                return; // Already migrated or has data
            }

            // Check for old localStorage data
            const oldProjects = localStorage.getItem('projectflow-projects');
            const oldTasks = localStorage.getItem('projectflow-tasks');

            if (oldProjects || oldTasks) {
                console.log('Migrating data from localStorage to IndexedDB...');
                
                if (oldProjects) {
                    const projects = JSON.parse(oldProjects);
                    await this.db.bulkAddProjects(projects);
                }

                if (oldTasks) {
                    const tasks = JSON.parse(oldTasks);
                    await this.db.bulkAddTasks(tasks);
                }

                // Clean up old localStorage data
                localStorage.removeItem('projectflow-projects');
                localStorage.removeItem('projectflow-tasks');
                
                console.log('Migration completed successfully');
                this.showToast('Data migrated successfully', 'success');
            }
        } catch (error) {
            console.error('Migration failed:', error);
            this.showToast('Data migration failed', 'error');
        }
    }

    // Load sample data if database is empty
    async loadSampleDataIfNeeded() {
        try {
            const existingProjects = await this.db.getAllProjects();
            if (existingProjects.length === 0) {
                await this.loadSampleData();
            }
        } catch (error) {
            console.error('Failed to load sample data:', error);
        }
    }

    async loadSampleData() {
        const sampleProjects = [
            {
                id: 'proj-1',
                name: 'IRRBB Implementation',
                description: 'Interest Rate Risk in the Banking Book - Implement comprehensive IRRBB framework to comply with regulatory requirements and enhance risk management capabilities.',
                status: 'active',
                dueDate: '2025-03-15',
                createdDate: '2025-01-01'
            },
            {
                id: 'proj-2',
                name: 'Valuation IPV Enhancement',
                description: 'Independent Price Verification - Enhance IPV processes and systems to improve valuation accuracy and regulatory compliance for trading book positions.',
                status: 'active',
                dueDate: '2025-02-28',
                createdDate: '2025-01-05'
            },
            {
                id: 'proj-3',
                name: 'HKTR Reform Compliance',
                description: 'Hong Kong Trade Repository Reform - Implement changes required for HKTR reform compliance including system updates and process modifications.',
                status: 'in-progress',
                dueDate: '2025-04-30',
                createdDate: '2025-01-10'
            }
        ];

        const sampleTasks = [
            // IRRBB Implementation Tasks
            {
                id: 'task-1',
                title: 'Gather IRRBB Business Requirements',
                description: 'Conduct stakeholder interviews and workshops to gather comprehensive business requirements for IRRBB implementation including regulatory expectations and business needs.',
                projectId: 'proj-1',
                priority: 'high',
                status: 'completed',
                dueDate: '2025-01-20',
                createdDate: '2025-01-01'
            },
            {
                id: 'task-2',
                title: 'Analyze Current Data Sources',
                description: 'Perform detailed analysis of existing data sources, data quality, and data lineage to support IRRBB calculations and reporting requirements.',
                projectId: 'proj-1',
                priority: 'high',
                status: 'completed',
                dueDate: '2025-01-25',
                createdDate: '2025-01-02'
            },
            {
                id: 'task-3',
                title: 'Develop IRRBB Process Flows',
                description: 'Create detailed process flows for data ingestion, transformation, calculation, and reporting for IRRBB framework implementation.',
                projectId: 'proj-1',
                priority: 'medium',
                status: 'in-progress',
                dueDate: '2025-02-10',
                createdDate: '2025-01-15'
            },
            {
                id: 'task-4',
                title: 'Prepare IRRBB UAT Test Cases',
                description: 'Design and prepare comprehensive User Acceptance Testing scenarios and test cases for IRRBB system validation and sign-off.',
                projectId: 'proj-1',
                priority: 'medium',
                status: 'todo',
                dueDate: '2025-02-25',
                createdDate: '2025-01-20'
            },
            {
                id: 'task-5',
                title: 'Facilitate IRRBB Stakeholder Workshops',
                description: 'Organize and facilitate workshops with risk management, treasury, and IT teams to validate requirements and ensure alignment on IRRBB implementation.',
                projectId: 'proj-1',
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-02-15',
                createdDate: '2025-01-25'
            },

            // Valuation IPV Enhancement Tasks
            {
                id: 'task-6',
                title: 'Document Current IPV Methodologies',
                description: 'Create comprehensive documentation of existing Independent Price Verification methodologies, processes, and control frameworks.',
                projectId: 'proj-2',
                priority: 'medium',
                status: 'completed',
                dueDate: '2025-01-30',
                createdDate: '2025-01-05'
            },
            {
                id: 'task-7',
                title: 'Perform IPV Gap Analysis',
                description: 'Conduct detailed gap analysis between current state IPV processes and target state requirements including regulatory expectations and best practices.',
                projectId: 'proj-2',
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-02-05',
                createdDate: '2025-01-10'
            },
            {
                id: 'task-8',
                title: 'Design New IPV Data Models',
                description: 'Design enhanced data models for IPV adjustments, price sources, and validation rules to support improved valuation accuracy.',
                projectId: 'proj-2',
                priority: 'high',
                status: 'todo',
                dueDate: '2025-02-15',
                createdDate: '2025-01-15'
            },
            {
                id: 'task-9',
                title: 'Coordinate IPV System Implementation',
                description: 'Work closely with IT development teams to coordinate system implementation, testing, and deployment of enhanced IPV capabilities.',
                projectId: 'proj-2',
                priority: 'medium',
                status: 'todo',
                dueDate: '2025-02-20',
                createdDate: '2025-01-18'
            },
            {
                id: 'task-10',
                title: 'Create IPV Training Materials',
                description: 'Develop comprehensive training materials and user guides for the new IPV framework including process changes and system updates.',
                projectId: 'proj-2',
                priority: 'low',
                status: 'todo',
                dueDate: '2025-02-25',
                createdDate: '2025-01-20'
            },

            // HKTR Reform Compliance Tasks
            {
                id: 'task-11',
                title: 'Review HKMA Consultation Papers',
                description: 'Thoroughly review and analyze HKMA consultation papers on Trade Repository reform to understand regulatory requirements and implications.',
                projectId: 'proj-3',
                priority: 'high',
                status: 'completed',
                dueDate: '2025-01-25',
                createdDate: '2025-01-10'
            },
            {
                id: 'task-12',
                title: 'Assess HKTR Impact on Trade Reporting',
                description: 'Assess the impact of new HKTR regulations on existing trade reporting processes, systems, and data requirements.',
                projectId: 'proj-3',
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-02-10',
                createdDate: '2025-01-12'
            },
            {
                id: 'task-13',
                title: 'Define HKTR Functional Specifications',
                description: 'Define detailed functional specifications for system changes required to comply with HKTR reform requirements.',
                projectId: 'proj-3',
                priority: 'medium',
                status: 'todo',
                dueDate: '2025-02-28',
                createdDate: '2025-01-15'
            },
            {
                id: 'task-14',
                title: 'Support Legal and Compliance Teams',
                description: 'Provide business analysis support to legal and compliance teams for interpretation of HKTR requirements and regulatory implications.',
                projectId: 'proj-3',
                priority: 'medium',
                status: 'in-progress',
                dueDate: '2025-02-20',
                createdDate: '2025-01-18'
            },
            {
                id: 'task-15',
                title: 'Plan Historical Data Migration Strategy',
                description: 'Develop comprehensive migration strategy for historical trade data to ensure compliance with new HKTR reporting requirements.',
                projectId: 'proj-3',
                priority: 'high',
                status: 'todo',
                dueDate: '2025-03-15',
                createdDate: '2025-01-22'
            }
        ];

        try {
            await this.db.bulkAddProjects(sampleProjects);
            await this.db.bulkAddTasks(sampleTasks);
            console.log('Sample data loaded successfully');
        } catch (error) {
            console.error('Failed to load sample data:', error);
        }
    }

    // Event listeners setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.showView(view);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Global search
        document.getElementById('globalSearch')?.addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Quick actions
        document.getElementById('quickAddProject')?.addEventListener('click', () => {
            this.showProjectModal();
        });

        document.getElementById('quickAddTask')?.addEventListener('click', () => {
            this.showTaskModal();
        });

        // Project modal
        document.getElementById('addProjectBtn')?.addEventListener('click', () => {
            this.showProjectModal();
        });

        document.getElementById('closeProjectModal')?.addEventListener('click', () => {
            this.hideProjectModal();
        });

        document.getElementById('cancelProjectModal')?.addEventListener('click', () => {
            this.hideProjectModal();
        });

        document.getElementById('saveProject')?.addEventListener('click', () => {
            this.saveProject();
        });

        // Task modal
        document.getElementById('addTaskBtn')?.addEventListener('click', () => {
            this.showTaskModal();
        });

        document.getElementById('closeTaskModal')?.addEventListener('click', () => {
            this.hideTaskModal();
        });

        document.getElementById('cancelTaskModal')?.addEventListener('click', () => {
            this.hideTaskModal();
        });

        document.getElementById('saveTask')?.addEventListener('click', () => {
            this.saveTask();
        });

        // Task filters
        document.getElementById('filterProject')?.addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('filterPriority')?.addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('filterStatus')?.addEventListener('change', () => {
            this.filterTasks();
        });

        // View toggles
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const viewType = e.currentTarget.dataset.viewType;
                this.toggleTaskView(viewType);
            });
        });

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.navigateCalendar(-1);
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.navigateCalendar(1);
        });

        // Modal overlay clicks
        document.getElementById('projectModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.hideProjectModal();
            }
        });

        document.getElementById('taskModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.hideTaskModal();
            }
        });
    }

    // View management
    showView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}View`)?.classList.add('active');

        this.currentView = viewName;
        this.refreshCurrentView();
    }

    async refreshCurrentView() {
        switch (this.currentView) {
            case 'dashboard':
                await this.refreshDashboard();
                break;
            case 'projects':
                await this.refreshProjects();
                break;
            case 'tasks':
                await this.refreshTasks();
                break;
        }
    }

    async refreshAllViews() {
        await this.refreshDashboard();
        await this.refreshProjects();
        await this.refreshTasks();
    }

    // Dashboard
    async refreshDashboard() {
        try {
            const projects = await this.db.getAllProjects();
            const tasks = await this.db.getAllTasks();

            // Update statistics
            document.getElementById('totalProjects').textContent = projects.length;
            document.getElementById('activeTasks').textContent = tasks.filter(t => t.status !== 'completed').length;
            document.getElementById('completedTasks').textContent = tasks.filter(t => t.status === 'completed').length;
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('tasksDueToday').textContent = tasks.filter(t => t.dueDate === today).length;

            // Update activity feed
            this.updateActivityFeed(projects, tasks);

            // Update calendar
            this.updateCalendar();
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }

    updateActivityFeed(projects, tasks) {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        // Create activity items from recent projects and tasks
        const activities = [];

        // Add recent projects
        projects.slice(0, 3).forEach(project => {
            activities.push({
                text: `Project "${project.name}" was created`,
                time: this.formatRelativeTime(project.createdDate),
                type: 'project'
            });
        });

        // Add recent tasks
        tasks.slice(0, 5).forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            activities.push({
                text: `Task "${task.title}" ${task.status === 'completed' ? 'completed' : 'updated'} in ${project?.name || 'Unknown Project'}`,
                time: this.formatRelativeTime(task.createdDate),
                type: 'task'
            });
        });

        // Sort by most recent and limit
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const recentActivities = activities.slice(0, 8);

        activityFeed.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    }

    // Calendar
    updateCalendar() {
        const calendarContainer = document.getElementById('calendarContainer');
        const monthYearElement = document.getElementById('calendarMonthYear');
        
        if (!calendarContainer || !monthYearElement) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        monthYearElement.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);

        this.renderCalendar(calendarContainer, year, month);
    }

    async renderCalendar(container, year, month) {
        try {
            const tasks = await this.db.getAllTasks();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            const calendarHTML = `
                <div class="calendar-grid">
                    <div class="calendar-header">
                        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                            `<div class="calendar-day-header">${day}</div>`
                        ).join('')}
                    </div>
                    <div class="calendar-body">
                        ${this.generateCalendarDays(startDate, year, month, tasks)}
                    </div>
                </div>
            `;

            container.innerHTML = calendarHTML;
        } catch (error) {
            console.error('Failed to render calendar:', error);
        }
    }

    generateCalendarDays(startDate, year, month, tasks) {
        const days = [];
        const today = new Date();
        const currentDate = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            const dayTasks = tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === currentDate.toDateString();
            });

            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === today.toDateString();
            const hasTasks = dayTasks.length > 0;

            let dayClass = 'calendar-day';
            if (!isCurrentMonth) dayClass += ' empty';
            if (isToday) dayClass += ' today';
            if (hasTasks) dayClass += ' has-tasks';

            const dayContent = isCurrentMonth ? `
                <div class="calendar-day-number">${currentDate.getDate()}</div>
                ${hasTasks ? `<div class="calendar-task-count">${dayTasks.length}</div>` : ''}
                <div class="calendar-tasks">
                    ${dayTasks.slice(0, 3).map(task => `
                        <div class="calendar-task priority-${task.priority}" title="${task.title}">
                            ${task.title}
                        </div>
                    `).join('')}
                    ${dayTasks.length > 3 ? `<div class="calendar-task-more">+${dayTasks.length - 3} more</div>` : ''}
                </div>
            ` : '';

            days.push(`<div class="${dayClass}">${dayContent}</div>`);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days.join('');
    }

    navigateCalendar(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateCalendar();
    }

    // Projects
    async refreshProjects() {
        try {
            const projects = await this.db.getAllProjects();
            const tasks = await this.db.getAllTasks();
            
            const projectsGrid = document.getElementById('projectsGrid');
            if (!projectsGrid) return;

            if (projects.length === 0) {
                projectsGrid.innerHTML = '<div class="no-projects">No projects found. Create your first project!</div>';
                return;
            }

            projectsGrid.innerHTML = projects.map(project => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                const completedTasks = projectTasks.filter(task => task.status === 'completed');
                const overdueTasks = projectTasks.filter(task => {
                    if (!task.dueDate || task.status === 'completed') return false;
                    return new Date(task.dueDate) < new Date();
                });
                
                const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
                const progressClass = progress >= 80 ? 'progress-excellent' : 
                                    progress >= 60 ? 'progress-good' : 
                                    progress >= 40 ? 'progress-fair' : 'progress-poor';

                const dueDate = project.dueDate ? new Date(project.dueDate) : null;
                const isOverdue = dueDate && dueDate < new Date();
                const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

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
                                    <span class="stat-number">${projectTasks.length}</span>
                                    <span class="stat-label">Total Tasks</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${completedTasks.length}</span>
                                    <span class="stat-label">Completed</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${projectTasks.length - completedTasks.length}</span>
                                    <span class="stat-label">Remaining</span>
                                </div>
                                <div class="stat-item ${overdueTasks.length > 0 ? 'stat-warning' : ''}">
                                    <span class="stat-number">${overdueTasks.length}</span>
                                    <span class="stat-label">Overdue</span>
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

                            <div class="project-progress">
                                <div class="progress-label">
                                    <span>Progress</span>
                                    <span>${progress}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="project-actions" onclick="event.stopPropagation()">
                            <button class="btn btn--outline btn--xs" onclick="projectManager.editProject('${project.id}')">
                                <span class="btn-icon">✏️</span> Edit
                            </button>
                            <button class="btn btn--outline btn--xs btn-danger" onclick="projectManager.deleteProject('${project.id}')">
                                <span class="btn-icon">🗑️</span> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to refresh projects:', error);
        }
    }

    // Tasks
    async refreshTasks() {
        try {
            const tasks = await this.db.getAllTasks();
            const projects = await this.db.getAllProjects();
            
            // Update project filter dropdown
            this.updateProjectFilter(projects);
            
            // Filter and display tasks
            this.filterTasks();
        } catch (error) {
            console.error('Failed to refresh tasks:', error);
        }
    }

    updateProjectFilter(projects) {
        const filterProject = document.getElementById('filterProject');
        if (!filterProject) return;

        const currentValue = filterProject.value;
        filterProject.innerHTML = '<option value="">All Projects</option>' +
            projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('');
        filterProject.value = currentValue;
    }

    async filterTasks() {
        try {
            const tasks = await this.db.getAllTasks();
            const projects = await this.db.getAllProjects();
            
            const projectFilter = document.getElementById('filterProject')?.value || '';
            const priorityFilter = document.getElementById('filterPriority')?.value || '';
            const statusFilter = document.getElementById('filterStatus')?.value || '';

            let filteredTasks = tasks.filter(task => {
                return (!projectFilter || task.projectId === projectFilter) &&
                       (!priorityFilter || task.priority === priorityFilter) &&
                       (!statusFilter || task.status === statusFilter);
            });

            // Sort tasks by due date and priority
            filteredTasks.sort((a, b) => {
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
                return 0;
            });

            this.displayTasks(filteredTasks, projects);
            this.displayKanbanTasks(filteredTasks, projects);
        } catch (error) {
            console.error('Failed to filter tasks:', error);
        }
    }

    displayTasks(tasks, projects) {
        const tasksContainer = document.getElementById('tasksContainer');
        if (!tasksContainer) return;

        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<div class="no-tasks">No tasks found matching your filters.</div>';
            return;
        }

        tasksContainer.innerHTML = tasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

            return `
                <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" onclick="projectManager.editTask('${task.id}')">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    
                    <div class="task-meta">
                        <span class="task-project">${project?.name || 'Unknown Project'}</span>
                        ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>

                    <div class="task-actions" onclick="event.stopPropagation()">
                        <button class="btn btn--outline btn--sm" onclick="projectManager.editTask('${task.id}')">Edit</button>
                        <button class="btn btn--outline btn--sm btn-danger" onclick="projectManager.deleteTask('${task.id}')">Delete</button>
                        <button class="btn btn--primary btn--sm" onclick="projectManager.toggleTaskStatus('${task.id}')">${task.status === 'completed' ? 'Reopen' : 'Complete'}</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayKanbanTasks(tasks, projects) {
        const todoColumn = document.getElementById('todoColumn');
        const inProgressColumn = document.getElementById('inProgressColumn');
        const completedColumn = document.getElementById('completedColumn');

        if (!todoColumn || !inProgressColumn || !completedColumn) return;

        const todoTasks = tasks.filter(task => task.status === 'todo');
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
        const completedTasks = tasks.filter(task => task.status === 'completed');

        const renderKanbanTask = (task) => {
            const project = projects.find(p => p.id === task.projectId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

            return `
                <div class="kanban-task priority-${task.priority}" onclick="projectManager.editTask('${task.id}')">
                    <div class="kanban-task-title">${task.title}</div>
                    ${task.description ? `<div class="kanban-task-description">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</div>` : ''}
                    <div class="kanban-task-meta">
                        <span class="task-project">${project?.name || 'Unknown'}</span>
                        ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
            `;
        };

        todoColumn.innerHTML = todoTasks.map(renderKanbanTask).join('');
        inProgressColumn.innerHTML = inProgressTasks.map(renderKanbanTask).join('');
        completedColumn.innerHTML = completedTasks.map(renderKanbanTask).join('');
    }

    toggleTaskView(viewType) {
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
        document.querySelector(`[data-view-type="${viewType}"]`)?.classList.add('active');

        const listView = document.getElementById('taskListView');
        const kanbanView = document.getElementById('kanbanView');

        if (viewType === 'kanban') {
            listView?.classList.add('hidden');
            kanbanView?.classList.remove('hidden');
        } else {
            listView?.classList.remove('hidden');
            kanbanView?.classList.add('hidden');
        }
    }

    // Project CRUD operations
    showProjectModal(projectId = null) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const form = document.getElementById('projectForm');

        if (!modal || !title || !form) return;

        this.currentProject = projectId;
        title.textContent = projectId ? 'Edit Project' : 'Add Project';

        if (projectId) {
            this.loadProjectData(projectId);
        } else {
            form.reset();
        }

        modal.classList.add('active');
    }

    async loadProjectData(projectId) {
        try {
            const project = await this.db.getProject(projectId);
            if (!project) return;

            document.getElementById('projectName').value = project.name || '';
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStatus').value = project.status || 'active';
            document.getElementById('projectDueDate').value = project.dueDate || '';
        } catch (error) {
            console.error('Failed to load project data:', error);
        }
    }

    hideProjectModal() {
        const modal = document.getElementById('projectModal');
        modal?.classList.remove('active');
        this.currentProject = null;
    }

    async saveProject() {
        try {
            const name = document.getElementById('projectName').value.trim();
            const description = document.getElementById('projectDescription').value.trim();
            const status = document.getElementById('projectStatus').value;
            const dueDate = document.getElementById('projectDueDate').value;

            if (!name) {
                this.showToast('Project name is required', 'error');
                return;
            }

            const projectData = {
                name,
                description,
                status,
                dueDate: dueDate || null
            };

            if (this.currentProject) {
                // Update existing project
                const existingProject = await this.db.getProject(this.currentProject);
                const updatedProject = { ...existingProject, ...projectData };
                await this.db.updateProject(updatedProject);
                this.showToast('Project updated successfully', 'success');
            } else {
                // Create new project
                const newProject = {
                    id: 'proj-' + Date.now(),
                    ...projectData,
                    createdDate: new Date().toISOString().split('T')[0]
                };
                await this.db.addProject(newProject);
                this.showToast('Project created successfully', 'success');
            }

            this.hideProjectModal();
            await this.refreshAllViews();
        } catch (error) {
            console.error('Failed to save project:', error);
            this.showToast('Failed to save project', 'error');
        }
    }

    async editProject(projectId) {
        this.showProjectModal(projectId);
    }

    async deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
            return;
        }

        try {
            await this.db.deleteTasksByProject(projectId);
            await this.db.deleteProject(projectId);
            this.showToast('Project deleted successfully', 'success');
            await this.refreshAllViews();
        } catch (error) {
            console.error('Failed to delete project:', error);
            this.showToast('Failed to delete project', 'error');
        }
    }

    // Task CRUD operations
    showTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const form = document.getElementById('taskForm');

        if (!modal || !title || !form) return;

        this.currentTask = taskId;
        title.textContent = taskId ? 'Edit Task' : 'Add Task';

        this.loadTaskProjects();

        if (taskId) {
            this.loadTaskData(taskId);
        } else {
            form.reset();
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskStatus').value = 'todo';
        }

        modal.classList.add('active');
    }

    async loadTaskProjects() {
        try {
            const projects = await this.db.getAllProjects();
            const taskProject = document.getElementById('taskProject');
            
            if (!taskProject) return;

            const currentValue = taskProject.value;
            taskProject.innerHTML = '<option value="">Select Project</option>' +
                projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('');
            taskProject.value = currentValue;
        } catch (error) {
            console.error('Failed to load task projects:', error);
        }
    }

    async loadTaskData(taskId) {
        try {
            const task = await this.db.getTask(taskId);
            if (!task) return;

            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskProject').value = task.projectId || '';
            document.getElementById('taskPriority').value = task.priority || 'medium';
            document.getElementById('taskStatus').value = task.status || 'todo';
            document.getElementById('taskDueDate').value = task.dueDate || '';
        } catch (error) {
            console.error('Failed to load task data:', error);
        }
    }

    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        modal?.classList.remove('active');
        this.currentTask = null;
    }

    async saveTask() {
        try {
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

            const taskData = {
                title,
                description,
                projectId,
                priority,
                status,
                dueDate: dueDate || null
            };

            if (this.currentTask) {
                // Update existing task
                const existingTask = await this.db.getTask(this.currentTask);
                const updatedTask = { ...existingTask, ...taskData };
                await this.db.updateTask(updatedTask);
                this.showToast('Task updated successfully', 'success');
            } else {
                // Create new task
                const newTask = {
                    id: 'task-' + Date.now(),
                    ...taskData,
                    createdDate: new Date().toISOString().split('T')[0]
                };
                await this.db.addTask(newTask);
                this.showToast('Task created successfully', 'success');
            }

            this.hideTaskModal();
            await this.refreshAllViews();
        } catch (error) {
            console.error('Failed to save task:', error);
            this.showToast('Failed to save task', 'error');
        }
    }

    async editTask(taskId) {
        this.showTaskModal(taskId);
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await this.db.deleteTask(taskId);
            this.showToast('Task deleted successfully', 'success');
            await this.refreshAllViews();
        } catch (error) {
            console.error('Failed to delete task:', error);
            this.showToast('Failed to delete task', 'error');
        }
    }

    async toggleTaskStatus(taskId) {
        try {
            const task = await this.db.getTask(taskId);
            if (!task) return;

            const newStatus = task.status === 'completed' ? 'todo' : 'completed';
            const updatedTask = { ...task, status: newStatus };
            
            await this.db.updateTask(updatedTask);
            this.showToast(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`, 'success');
            await this.refreshAllViews();
        } catch (error) {
            console.error('Failed to toggle task status:', error);
            this.showToast('Failed to update task status', 'error');
        }
    }

    // Search functionality
    async handleGlobalSearch(query) {
        if (!query.trim()) {
            await this.refreshCurrentView();
            return;
        }

        try {
            const projects = await this.db.getAllProjects();
            const tasks = await this.db.getAllTasks();

            const filteredProjects = projects.filter(project =>
                project.name.toLowerCase().includes(query.toLowerCase()) ||
                (project.description && project.description.toLowerCase().includes(query.toLowerCase()))
            );

            const filteredTasks = tasks.filter(task =>
                task.title.toLowerCase().includes(query.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
            );

            // Update current view with filtered results
            if (this.currentView === 'projects') {
                this.displayFilteredProjects(filteredProjects, tasks);
            } else if (this.currentView === 'tasks') {
                this.displayTasks(filteredTasks, projects);
                this.displayKanbanTasks(filteredTasks, projects);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    displayFilteredProjects(projects, allTasks) {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;

        if (projects.length === 0) {
            projectsGrid.innerHTML = '<div class="no-projects">No projects found matching your search.</div>';
            return;
        }

        // Use the same rendering logic as refreshProjects but with filtered data
        projectsGrid.innerHTML = projects.map(project => {
            const projectTasks = allTasks.filter(task => task.projectId === project.id);
            const completedTasks = projectTasks.filter(task => task.status === 'completed');
            const overdueTasks = projectTasks.filter(task => {
                if (!task.dueDate || task.status === 'completed') return false;
                return new Date(task.dueDate) < new Date();
            });
            
            const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
            const progressClass = progress >= 80 ? 'progress-excellent' : 
                                progress >= 60 ? 'progress-good' : 
                                progress >= 40 ? 'progress-fair' : 'progress-poor';

            const dueDate = project.dueDate ? new Date(project.dueDate) : null;
            const isOverdue = dueDate && dueDate < new Date();
            const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

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
                                <span class="stat-number">${projectTasks.length}</span>
                                <span class="stat-label">Total Tasks</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${completedTasks.length}</span>
                                <span class="stat-label">Completed</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${projectTasks.length - completedTasks.length}</span>
                                <span class="stat-label">Remaining</span>
                            </div>
                            <div class="stat-item ${overdueTasks.length > 0 ? 'stat-warning' : ''}">
                                <span class="stat-number">${overdueTasks.length}</span>
                                <span class="stat-label">Overdue</span>
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

                        <div class="project-progress">
                            <div class="progress-label">
                                <span>Progress</span>
                                <span>${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="project-actions" onclick="event.stopPropagation()">
                        <button class="btn btn--outline btn--xs" onclick="projectManager.editProject('${project.id}')">
                            <span class="btn-icon">✏️</span> Edit
                        </button>
                        <button class="btn btn--outline btn--xs btn-danger" onclick="projectManager.deleteProject('${project.id}')">
                            <span class="btn-icon">🗑️</span> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
let projectManager;
document.addEventListener('DOMContentLoaded', () => {
    projectManager = new ProjectManager();
});