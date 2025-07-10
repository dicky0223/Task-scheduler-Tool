// UI rendering functions
import { formatDate, isToday, formatRelativeTime, getStatusClass, getStatusIcon, getTasksForDate, getTasksDueToday, getLocalDateFromYYYYMMDD, formatDateToDDMMYYYY, getTodayYYYYMMDDLocal } from '../utils/helpers.js';
import { showToast } from './toast.js';

export function renderDashboard(projects, tasks) {
    // Update statistics
    const totalProjects = projects.length;
    const activeTasks = tasks.filter(task => task.status !== 'completed').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const tasksDueToday = getTasksDueToday(tasks).length;

    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('tasksDueToday').textContent = tasksDueToday;

    // Render activity feed
    renderActivityFeed(projects, tasks);
}

export function renderActivityFeed(projects, tasks) {
    const activityFeed = document.getElementById('activityFeed');
    
    // Generate recent activities based on tasks and projects
    const activities = [];
    
    // Recent task completions
    const recentCompletedTasks = tasks
        .filter(task => task.status === 'completed')
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 3);
        
    recentCompletedTasks.forEach(task => {
        const project = projects.find(p => p.id === task.projectId);
        activities.push({
            text: `Completed task "${task.title}" in ${project?.name || 'Unknown Project'}`,
            time: formatRelativeTime(task.createdDate),
            type: 'success'
        });
    });

    // Recent project updates
    const recentProjects = projects
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 2);
        
    recentProjects.forEach(project => {
        activities.push({
            text: `Created project "${project.name}"`,
            time: formatRelativeTime(project.createdDate),
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

export function renderCalendar(currentDate, projects, tasks, onDateClick) {
    const container = document.getElementById('calendarContainer');
    const monthYear = document.getElementById('calendarMonthYear');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    monthYear.textContent = new Date(year, month).toLocaleDateString('en-GB', {
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
        const currentDateObj = new Date(year, month, day);
        const dateString = formatDate(currentDateObj);
        const isTodayFlag = isToday(currentDateObj);
        const tasksForDay = getTasksForDate(tasks, dateString);
        const hasTasksClass = tasksForDay.length > 0 ? 'has-tasks' : '';
        const todayClass = isTodayFlag ? 'today' : '';

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
    addCalendarClickListeners(projects, tasks, onDateClick);
}

export function addCalendarClickListeners(projects, tasks, onDateClick) {
    const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');
    
    calendarDays.forEach(dayElement => {
        dayElement.addEventListener('click', (e) => {
            const dateString = dayElement.dataset.date;
            if (dateString && onDateClick) {
                onDateClick(dateString);
            }
        });
    });
}

export function displayTasksForDate(dateString, projects, tasks) {
    const tasksForDay = getTasksForDate(tasks, dateString);
    const localDate = getLocalDateFromYYYYMMDD(dateString);
    const formattedDate = localDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (tasksForDay.length === 0) {
        showToast(`No tasks scheduled for ${formattedDate}`, 'info');
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
            const project = projects.find(p => p.id === task.projectId);
            const statusIcon = getStatusIcon(task.status);
            message += `${statusIcon} ${task.title} (${project?.name || 'No Project'})\n`;
        });
        message += '\n';
    }

    // Add medium priority tasks
    if (tasksByPriority.medium.length > 0) {
        message += `🟡 Medium Priority (${tasksByPriority.medium.length}):\n`;
        tasksByPriority.medium.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            const statusIcon = getStatusIcon(task.status);
            message += `${statusIcon} ${task.title} (${project?.name || 'No Project'})\n`;
        });
        message += '\n';
    }

    // Add low priority tasks
    if (tasksByPriority.low.length > 0) {
        message += `🔵 Low Priority (${tasksByPriority.low.length}):\n`;
        tasksByPriority.low.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            const statusIcon = getStatusIcon(task.status);
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

    showToast(message, toastType);
}

export function renderProjects(projects, tasks, onEditProject, onDeleteProject) {
    const container = document.getElementById('projectsGrid');
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No projects yet</h3>
                <p>Create your first project to get started</p>
                <button class="btn btn--primary" onclick="window.projectManager.openProjectModal()">Create Project</button>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
        const totalTasks = projectTasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const overdueTasks = projectTasks.filter(task => 
            task.status !== 'completed' && 
            task.dueDate && 
            getLocalDateFromYYYYMMDD(task.dueDate) < new Date()
        ).length;

        const dueDate = project.dueDate ? getLocalDateFromYYYYMMDD(project.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && project.status !== 'completed';
        const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

        let progressClass = 'progress-poor';
        if (progress >= 80) progressClass = 'progress-excellent';
        else if (progress >= 60) progressClass = 'progress-good';
        else if (progress >= 30) progressClass = 'progress-fair';

        return `
            <div class="enhanced-project-card" onclick="window.projectManager.editProject('${project.id}')">
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
                            <span class="timeline-value">${formatDateToDDMMYYYY(getLocalDateFromYYYYMMDD(project.createdDate))}</span>
                        </div>
                        ${project.dueDate ? `
                            <div class="timeline-item ${isOverdue ? 'upcoming' : ''}">
                                <span class="timeline-label">Due:</span>
                                <span class="timeline-value ${isOverdue ? 'overdue' : ''}">${formatDateToDDMMYYYY(dueDate)}</span>
                                ${daysUntilDue !== null ? `<span class="timeline-value">(${daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`})</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="project-actions">
                    <button class="btn btn--outline btn--xs" onclick="event.stopPropagation(); window.projectManager.editProject('${project.id}')">
                        <span class="btn-icon">✏️</span>Edit
                    </button>
                    <button class="btn btn--outline btn--xs btn-danger" onclick="event.stopPropagation(); window.projectManager.deleteProject('${project.id}')">
                        <span class="btn-icon">🗑️</span>Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

export function renderTasks(projects, tasks, onEditTask, onDeleteTask, onToggleTaskStatus) {
    const container = document.getElementById('tasksContainer');
    let filteredTasks = [...tasks];

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
                <button class="btn btn--primary" onclick="window.projectManager.openTaskModal()">Create Task</button>
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
        const project = projects.find(p => p.id === task.projectId);
        const isOverdue = task.dueDate && getLocalDateFromYYYYMMDD(task.dueDate) < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" onclick="window.projectManager.editTask('${task.id}')">
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
                                Due: ${formatDateToDDMMYYYY(getLocalDateFromYYYYMMDD(task.dueDate))}
                                ${isOverdue ? ' (Overdue)' : ''}
                            </span>
                        ` : ''}
                    </div>
                    <span class="status status--${getStatusClass(task.status)}">${task.status.replace('-', ' ')}</span>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); window.projectManager.toggleTaskStatus('${task.id}')">
                        ${task.status === 'completed' ? 'Reopen' : 'Complete'}
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="event.stopPropagation(); window.projectManager.editTask('${task.id}')">Edit</button>
                    <button class="btn btn--outline btn--sm btn-danger" onclick="event.stopPropagation(); window.projectManager.deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

export function renderKanban(projects, tasks, onEditTask) {
    const todoColumn = document.getElementById('todoColumn');
    const inProgressColumn = document.getElementById('inProgressColumn');
    const completedColumn = document.getElementById('completedColumn');

    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    const renderKanbanTasks = (tasks) => {
        return tasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            return `
                <div class="kanban-task priority-${task.priority}" onclick="window.projectManager.editTask('${task.id}')">
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