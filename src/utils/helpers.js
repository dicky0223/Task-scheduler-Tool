// Utility helper functions
export function createLocalDate(dateString) {
    if (!dateString) return null;
    
    // Parse the date string (YYYY-MM-DD) and create a Date object in local timezone
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}

export function formatDate(date) {
    // Extract local date components to avoid timezone conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function isToday(date) {
    const today = new Date();
    return formatDate(date) === formatDate(today);
}

export function formatRelativeTime(dateString) {
    const date = createLocalDate(dateString) || new Date(dateString);
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

export function isDateOverdue(dateString) {
    if (!dateString) return false;
    
    const dueDate = createLocalDate(dateString);
    const today = new Date();
    
    // Set both dates to start of day for accurate comparison
    const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return dueDateStart < todayStart;
}