// Utility helper functions
export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

export function getLocalDateFromYYYYMMDD(dateString) {
    if (!dateString) return null;
    
    // Parse the date string as YYYY-MM-DD and create a local date
    const [year, month, day] = dateString.split('-').map(Number);
    // Month is 0-indexed in JavaScript Date constructor
    // Set time to noon to avoid timezone issues
    return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatDateToDDMMYYYY(dateObject) {
    if (!dateObject || !(dateObject instanceof Date)) return '';
    
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = dateObject.getFullYear();
    
    return `${day}/${month}/${year}`;
}

export function getTodayYYYYMMDDLocal() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

export function isToday(date) {
    if (!date) return false;
    
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
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
    const today = getTodayYYYYMMDDLocal();
    return getTasksForDate(tasks, today);
}