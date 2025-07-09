// Toast notification system
export function showToast(message, type = 'info') {
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