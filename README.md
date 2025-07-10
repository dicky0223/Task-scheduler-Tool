# ProjectFlow - Project Management Tool

A modern, lightweight project management application built with vanilla JavaScript, HTML, and CSS. ProjectFlow helps you organize projects, track tasks, and visualize your workflow with an intuitive interface and powerful features.

## ✨ Features

### 📊 Dashboard Overview
- **Real-time Statistics**: View total projects, active tasks, completed tasks, and tasks due today
- **Activity Feed**: Track recent project and task activities
- **Quick Actions**: Rapidly create new projects and tasks
- **Task Calendar**: Visual calendar showing task deadlines and schedules

### 📁 Project Management
- **Project Cards**: Visual project overview with progress tracking
- **Status Management**: Track projects as Active, Completed, or On Hold
- **Progress Visualization**: Automatic progress calculation based on task completion
- **Project Details**: Rich descriptions, due dates, and metadata

### ✅ Task Management
- **Multiple Views**: Switch between List view and Kanban board
- **Priority Levels**: Organize tasks by High, Medium, and Low priority
- **Status Tracking**: Monitor tasks through To Do, In Progress, and Completed states
- **Advanced Filtering**: Filter tasks by project, priority, and status
- **Due Date Management**: Track deadlines with overdue indicators

### 📅 Calendar Integration
- **Monthly View**: Navigate through months to view task schedules
- **Task Visualization**: See tasks directly on calendar dates
- **Interactive Calendar**: Click on dates to view detailed task information
- **Due Date Highlighting**: Visual indicators for tasks and deadlines

### 🔍 Search & Organization
- **Global Search**: Search across all projects and tasks in real-time
- **Smart Filtering**: Filter tasks by project, priority, status, and due date
- **Sorting Options**: Sort tasks by due date, priority, or creation date

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Toast Notifications**: Real-time feedback for user actions
- **Intuitive Navigation**: Clean sidebar navigation with visual icons

## 🚀 Getting Started

### Running with a Local Server (Recommended)

For the best experience and to avoid browser security restrictions, we recommend running ProjectFlow with a local server. This ensures all features work correctly, including data persistence and search functionality.

#### Option 1: VS Code Live Server (Easiest for most users)

1. **Install VS Code** (if you don't have it)
   - Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
   - Install and open VS Code

2. **Install Live Server Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "Live Server" by Ritwick Dey
   - Click "Install"

3. **Open and Run ProjectFlow**
   - Download the ProjectFlow project files
   - Extract to a folder on your computer
   - In VS Code: File → Open Folder → Select the ProjectFlow folder
   - Right-click on `index.html` in the file explorer
   - Select "Open with Live Server"
   - ProjectFlow will automatically open in your browser at `http://127.0.0.1:5500`

#### Option 2: Python HTTP Server

1. **Ensure Python is installed**
   - Check by running `python --version` or `python3 --version` in your terminal
   - If not installed, download from [https://python.org](https://python.org)

2. **Run the server**
   - Download and extract ProjectFlow to a folder
   - Open terminal/command prompt
   - Navigate to the ProjectFlow folder:
     ```bash
     cd path/to/projectflow
     ```
   - Start the server:
     ```bash
     # For Python 3
     python -m http.server 8000
     
     # For Python 2 (if needed)
     python -m SimpleHTTPServer 8000
     ```
   - Open your browser and go to `http://localhost:8000`

#### Option 3: Node.js Development Server (For developers)

If you have Node.js installed and want the full development experience:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

### Quick Start (Direct File Opening)

⚠️ **Note**: Opening `index.html` directly in your browser may cause some limitations due to browser security restrictions. For full functionality, please use one of the local server methods above.

If you want to quickly try ProjectFlow without setting up a server:

1. **Download the project**
   - Click the green "Code" button on GitHub and select "Download ZIP"
   - Extract the ZIP file to a folder on your computer

2. **Open the application**
   - Navigate to the extracted folder
   - Double-click on `index.html` to open it in your web browser

3. **Start using ProjectFlow**
   - The application will load with sample data to help you get started
   - Create your first project by clicking "New Project"
   - Add tasks and start managing your workflow

## 📖 Usage Guide

### Getting Started
1. **Dashboard**: Start on the dashboard to see an overview of your projects and tasks
2. **Create a Project**: Click "New Project" to create your first project
3. **Add Tasks**: Navigate to the Tasks section and create tasks for your projects
4. **Track Progress**: Use the Kanban board or list view to manage task progress
5. **Search & Filter**: Use the global search bar to find specific projects or tasks
6. **Data Migration**: If you previously used ProjectFlow, your data will be automatically migrated from Local Storage to IndexedDB on first load

### Navigation
- **Dashboard** (📊): Overview of all projects and tasks with statistics
- **Projects** (📁): Manage and view all your projects
- **Tasks** (✓): Detailed task management with filtering and views

### Project Management
- **Create Project**: Fill in project name, description, status, and due date
- **Edit Project**: Click on any project card to modify details
- **Track Progress**: Progress is automatically calculated based on task completion
- **Delete Project**: Remove projects and all associated tasks

### Task Management
- **Create Task**: Assign tasks to projects with priority and due dates
- **List View**: Traditional task list with sorting and filtering
- **Kanban Board**: Visual workflow management with drag-and-drop columns
- **Quick Actions**: Mark tasks complete, edit details, or delete tasks
- **Search Tasks**: Use the global search to find tasks by title or description

### Calendar Features
- **Monthly Navigation**: Use arrow buttons to navigate between months
- **Task Visualization**: Tasks appear as colored indicators on their due dates
- **Priority Colors**: High (red), Medium (orange), Low (blue) priority indicators
- **Click Interaction**: Click on calendar dates to see detailed task information

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: IndexedDB for robust data persistence with automatic migration from Local Storage
- **Styling**: Custom CSS with CSS Variables for theming
- **Icons**: Unicode emojis for lightweight iconography
- **Responsive**: CSS Grid and Flexbox for responsive layouts

### Database Architecture
ProjectFlow uses IndexedDB for client-side data storage, providing:
- **Structured Storage**: Separate object stores for projects and tasks
- **Indexing**: Efficient querying by status, priority, due date, and project relationships
- **ACID Transactions**: Reliable data operations with rollback capabilities
- **Large Storage Capacity**: Much larger storage limits compared to Local Storage
- **Asynchronous Operations**: Non-blocking database operations for better performance

#### Database Schema
```javascript
// Projects Object Store
{
  keyPath: 'id',
  indexes: ['status', 'dueDate', 'createdDate']
}

// Tasks Object Store
{
  keyPath: 'id',
  indexes: ['projectId', 'status', 'priority', 'dueDate', 'createdDate']
}
```

### Architecture
```
projectflow/
├── index.html              # Main HTML structure
├── db.js                   # IndexedDB database operations
├── style.css               # Styling and themes
├── src/                    # Source code directory
│   ├── main.js            # Core application controller
│   ├── data/              # Data management
│   │   └── dbService.js   # Database service layer
│   ├── ui/                # User interface components
│   │   ├── modals.js      # Modal management
│   │   ├── renderers.js   # UI rendering functions
│   │   ├── theme.js       # Theme management
│   │   └── toast.js       # Toast notifications
│   └── utils/             # Utility functions
│       └── helpers.js     # Helper functions
├── package.json           # Project configuration
└── README.md              # Documentation
```

### Key Components
- **ProjectManager Class**: Main application controller in `src/main.js`
- **ProjectFlowDB Class**: IndexedDB database operations and management in `db.js`
- **Data Management**: IndexedDB with automatic migration from Local Storage via `src/data/dbService.js`
- **UI Components**: Modular UI components in `src/ui/` directory
- **Event Handling**: Comprehensive event listeners for user interactions
- **Theme System**: CSS custom properties for dark/light mode
- **Responsive Design**: Mobile-first approach with breakpoints

### Data Migration
ProjectFlow automatically handles migration from Local Storage to IndexedDB:
1. **First Load**: Checks for existing IndexedDB data
2. **Migration Detection**: If no IndexedDB data exists, checks Local Storage
3. **Automatic Migration**: Transfers all projects and tasks to IndexedDB
4. **Cleanup**: Removes Local Storage data after successful migration
5. **Fallback**: Loads sample data if no existing data is found

### Data Structure
```javascript
// Project Object
{
  id: "proj-1",
  name: "Website Redesign",
  description: "Complete overhaul...",
  status: "active", // active, completed, on-hold
  dueDate: "2025-07-15",
  createdDate: "2025-06-01"
}

// Task Object
{
  id: "task-1",
  title: "Create wireframes",
  description: "Design wireframes...",
  projectId: "proj-1",
  priority: "high", // high, medium, low
  status: "completed", // todo, in-progress, completed
  dueDate: "2025-06-15",
  createdDate: "2025-06-01"
}
```

## 🎯 Features in Detail

### Dashboard Statistics
- **Total Projects**: Count of all projects in the system
- **Active Tasks**: Tasks that are not completed
- **Completed Tasks**: Successfully finished tasks
- **Due Today**: Tasks with today's due date

### Filtering and Search
- **Global Search**: Real-time search across project names, descriptions, and task titles
- **Project Filter**: Show tasks from specific projects
- **Priority Filter**: Filter by High, Medium, or Low priority
- **Status Filter**: Filter by To Do, In Progress, or Completed
- **Due Date Sorting**: Sort tasks by due date to prioritize urgent items

### Theme System
- **Automatic Detection**: Respects system preference for dark/light mode
- **Manual Toggle**: Switch themes with the header toggle button
- **Persistent Storage**: Theme preference saved in local storage
- **CSS Variables**: Consistent theming across all components

## 📱 Browser Compatibility

ProjectFlow is compatible with all modern browsers:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🔧 Development

### Project Structure
- **Modular Design**: Separated components for maintainability
- **Event-Driven**: Comprehensive event handling system
- **Data Persistence**: IndexedDB with automatic migration and error handling
- **Responsive CSS**: Mobile-first responsive design
- **Async Operations**: Non-blocking database operations with proper error handling

### Customization
- **Themes**: Modify CSS custom properties in `:root`
- **Colors**: Update color variables for brand customization
- **Layout**: Adjust grid and flexbox properties for layout changes
- **Features**: Extend the ProjectManager class for new functionality
- **Database**: Modify the ProjectFlowDB class to add new data operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Test features across different browsers and devices
- Update documentation for new features
- Ensure responsive design principles are maintained
- Test database operations thoroughly, including migration scenarios
- Handle async operations with proper error handling

## 📄 License

This tool is developed by Dicky CH HO. Copyright © 2025 Dicky CH HO. All rights reserved.

## 🙏 Acknowledgments

- Built with vanilla JavaScript and IndexedDB for maximum compatibility and performance
- Inspired by modern project management tools
- Designed with accessibility and usability in mind
- Uses semantic HTML and ARIA attributes for screen readers
- Implements progressive enhancement with graceful fallbacks

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce
4. For database-related issues, check browser console for IndexedDB errors

For direct support, contact: chunhinhocuhk@gmail.com

---

**ProjectFlow** - Streamline your project management workflow with a clean, intuitive interface and robust data persistence that works everywhere.