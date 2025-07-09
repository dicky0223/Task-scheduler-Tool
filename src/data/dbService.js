// Database service layer
import { showToast } from '../ui/toast.js';

export async function loadData() {
    try {
        // Try to load from IndexedDB first
        const [projects, tasks] = await Promise.all([
            projectFlowDB.getAllProjects(),
            projectFlowDB.getAllTasks()
        ]);

        if (projects.length === 0 && tasks.length === 0) {
            // Check if we need to migrate from localStorage
            await migrateFromLocalStorage();
            
            // If still no data, load sample data
            const [newProjects, newTasks] = await Promise.all([
                projectFlowDB.getAllProjects(),
                projectFlowDB.getAllTasks()
            ]);
            
            if (newProjects.length === 0 && newTasks.length === 0) {
                await loadSampleData();
            }
        }

        // Load the final data
        const finalProjects = await projectFlowDB.getAllProjects();
        const finalTasks = await projectFlowDB.getAllTasks();
        
        console.log(`Loaded ${finalProjects.length} projects and ${finalTasks.length} tasks`);
        return { projects: finalProjects, tasks: finalTasks };
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
        return { projects: [], tasks: [] };
    }
}

export async function migrateFromLocalStorage() {
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
            
            showToast('Data migrated successfully to IndexedDB', 'success');
        }
    } catch (error) {
        console.error('Error migrating from localStorage:', error);
        showToast('Error migrating data', 'warning');
    }
}

export async function loadSampleData() {
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
        showToast('Sample data loaded', 'info');
    } catch (error) {
        console.error('Error loading sample data:', error);
        showToast('Error loading sample data', 'error');
    }
}