// Theme management system
import { showToast } from './toast.js';

export function getStoredTheme() {
    return localStorage.getItem('projectflow_theme') || 'auto';
}

export function setStoredTheme(theme) {
    localStorage.setItem('projectflow_theme', theme);
}

export function getPreferredTheme() {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'auto') {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme() {
    const theme = getPreferredTheme();
    document.documentElement.setAttribute('data-color-scheme', theme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

export function toggleTheme() {
    const currentTheme = getPreferredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setStoredTheme(newTheme);
    applyTheme();
    
    showToast(`Switched to ${newTheme} theme`, 'info');
    return newTheme;
}

// Initialize theme system
export function initializeTheme() {
    applyTheme();
    
    // Handle system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getStoredTheme() === 'auto') {
            applyTheme();
        }
    });
}