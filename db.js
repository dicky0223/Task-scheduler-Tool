// IndexedDB Helper for ProjectFlow
class ProjectFlowDB {
    constructor() {
        this.dbName = 'ProjectFlowDB';
        this.dbVersion = 1;
        this.db = null;
    }

    // Open database connection
    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create projects object store
                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectStore.createIndex('status', 'status', { unique: false });
                    projectStore.createIndex('dueDate', 'dueDate', { unique: false });
                    projectStore.createIndex('createdDate', 'createdDate', { unique: false });
                }

                // Create tasks object store
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    taskStore.createIndex('projectId', 'projectId', { unique: false });
                    taskStore.createIndex('status', 'status', { unique: false });
                    taskStore.createIndex('priority', 'priority', { unique: false });
                    taskStore.createIndex('dueDate', 'dueDate', { unique: false });
                    taskStore.createIndex('createdDate', 'createdDate', { unique: false });
                }
            };
        });
    }

    // Generic transaction helper
    async performTransaction(storeName, mode, operation) {
        try {
            if (!this.db) {
                await this.openDatabase();
            }

            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            return new Promise((resolve, reject) => {
                const request = operation(store);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    reject(new Error(`Transaction failed: ${request.error}`));
                };
            });
        } catch (error) {
            throw new Error(`Database operation failed: ${error.message}`);
        }
    }

    // Project CRUD operations
    async addProject(project) {
        return this.performTransaction('projects', 'readwrite', (store) => {
            return store.add(project);
        });
    }

    async getProject(id) {
        return this.performTransaction('projects', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateProject(project) {
        return this.performTransaction('projects', 'readwrite', (store) => {
            return store.put(project);
        });
    }

    async deleteProject(id) {
        return this.performTransaction('projects', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    async getAllProjects() {
        return this.performTransaction('projects', 'readonly', (store) => {
            return store.getAll();
        });
    }

    // Task CRUD operations
    async addTask(task) {
        return this.performTransaction('tasks', 'readwrite', (store) => {
            return store.add(task);
        });
    }

    async getTask(id) {
        return this.performTransaction('tasks', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateTask(task) {
        return this.performTransaction('tasks', 'readwrite', (store) => {
            return store.put(task);
        });
    }

    async deleteTask(id) {
        return this.performTransaction('tasks', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    async getAllTasks() {
        return this.performTransaction('tasks', 'readonly', (store) => {
            return store.getAll();
        });
    }

    // Get tasks by project ID
    async getTasksByProject(projectId) {
        return this.performTransaction('tasks', 'readonly', (store) => {
            const index = store.index('projectId');
            return index.getAll(projectId);
        });
    }

    // Delete all tasks for a project
    async deleteTasksByProject(projectId) {
        try {
            const tasks = await this.getTasksByProject(projectId);
            const deletePromises = tasks.map(task => this.deleteTask(task.id));
            await Promise.all(deletePromises);
            return tasks.length;
        } catch (error) {
            throw new Error(`Failed to delete tasks for project ${projectId}: ${error.message}`);
        }
    }

    // Bulk operations for migration
    async bulkAddProjects(projects) {
        try {
            const addPromises = projects.map(project => this.addProject(project));
            await Promise.all(addPromises);
            return projects.length;
        } catch (error) {
            throw new Error(`Bulk add projects failed: ${error.message}`);
        }
    }

    async bulkAddTasks(tasks) {
        try {
            const addPromises = tasks.map(task => this.addTask(task));
            await Promise.all(addPromises);
            return tasks.length;
        } catch (error) {
            throw new Error(`Bulk add tasks failed: ${error.message}`);
        }
    }

    // Clear all data (useful for testing)
    async clearAllData() {
        try {
            await this.performTransaction('projects', 'readwrite', (store) => {
                return store.clear();
            });
            await this.performTransaction('tasks', 'readwrite', (store) => {
                return store.clear();
            });
        } catch (error) {
            throw new Error(`Failed to clear data: ${error.message}`);
        }
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Create global instance
const projectFlowDB = new ProjectFlowDB();