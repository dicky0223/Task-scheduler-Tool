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
                id: 'proj-irrbb',
                name: 'IRRBB Implementation',
                description: 'Assist client in implementing new Interest Rate Risk in the Banking Book (IRRBB) regulatory framework and reporting.',
                status: 'active',
                dueDate: '2025-09-30',
                createdDate: '2025-06-01'
            },
            {
                id: 'proj-fy24val',
                name: 'FY24 Valuation Review',
                description: 'Conduct a comprehensive review and audit of the client\'s Fiscal Year 2024 financial valuations and models.',
                status: 'active',
                dueDate: '2025-08-15',
                createdDate: '2025-06-10'
            },
            {
                id: 'proj-hktr',
                name: 'HKTR Reform Advisory',
                description: 'Provide advisory services on the impact and implementation of the Hong Kong Trade Repository (HKTR) reform.',
                status: 'on-hold',
                dueDate: '2025-10-31',
                createdDate: '2025-05-20'
            }
        ];

        const sampleTasks = [
            // IRRBB Implementation Tasks
            {
                id: 'task-irrbb-1',
                title: 'Review current IRRBB policies',
                description: 'Analyze existing IRRBB policies and identify gaps against new regulations.',
                projectId: 'proj-irrbb',
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-07-15',
                createdDate: '2025-06-05'
            },
            {
                id: 'task-irrbb-2',
                title: 'Develop new reporting templates',
                description: 'Design and prototype new regulatory reporting templates for IRRBB.',
                projectId: 'proj-irrbb',
                priority: 'medium',
                status: 'todo',
                dueDate: '2025-08-01',
                createdDate: '2025-06-20'
            },
            {
                id: 'task-irrbb-3',
                title: 'Client workshop on data requirements',
                description: 'Facilitate a workshop with client teams to define data collection requirements for IRRBB.',
                projectId: 'proj-irrbb',
                priority: 'high',
                status: 'todo',
                dueDate: '2025-07-25',
                createdDate: '2025-07-01'
            },
            // FY24 Valuation Review Tasks
            {
                id: 'task-fy24-1',
                title: 'Collect FY24 financial statements',
                description: 'Gather all necessary financial statements and supporting documents for the valuation period.',
                projectId: 'proj-fy24val',
                priority: 'medium',
                status: 'completed',
                dueDate: '2025-06-25',
                createdDate: '2025-06-12'
            },
            {
                id: 'task-fy24-2',
                title: 'Analyze valuation models',
                description: 'Perform in-depth analysis of client\'s existing valuation models for accuracy and compliance.',
                projectId: 'proj-fy24val',
                priority: 'high',
                status: 'in-progress',
                dueDate: '2025-07-30',
                createdDate: '2025-06-18'
            },
            {
                id: 'task-fy24-3',
                title: 'Prepare audit findings report',
                description: 'Compile a comprehensive report detailing audit findings and recommendations.',
                projectId: 'proj-fy24val',
                priority: 'high',
                status: 'todo',
                dueDate: '2025-08-10',
                createdDate: '2025-07-01'
            },
            // HKTR Reform Advisory Tasks
            {
                id: 'task-hktr-1',
                title: 'Research HKTR regulatory changes',
                description: 'Conduct detailed research on the latest amendments and guidelines for HKTR.',
                projectId: 'proj-hktr',
                priority: 'low',
                status: 'todo',
                dueDate: '2025-09-15',
                createdDate: '2025-05-25'
            },
            {
                id: 'task-hktr-2',
                title: 'Draft client impact assessment',
                description: 'Outline the potential impact of HKTR reforms on client operations and systems.',
                projectId: 'proj-hktr',
                priority: 'medium',
                status: 'todo',
                dueDate: '2025-10-01',
                createdDate: '2025-06-01'
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
