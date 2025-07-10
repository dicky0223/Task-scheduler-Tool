// Utility helper functions
export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

export function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

export function getStatusClass(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'in-progress': return 'warning';
        case 'todo': return 'info';
        default: return 'info';
    }
}

export function getStatusIcon(status) {
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

export function getTasksForDate(tasks, dateString) {
    return tasks.filter(task => task.dueDate === dateString);
}

export function getTasksDueToday(tasks) {
    const today = formatDate(new Date());
    return getTasksForDate(tasks, today);
}