# Todo List Manager

A modern, full-featured todo list application built with React, TypeScript, and Firebase. Features hierarchical task organization with sublists, dark mode, real-time synchronization, and local storage for custom defaults.

## 🚀 Features

### Core Functionality
- **Multiple Todo Lists**: Create and manage multiple independent todo lists
- **Hierarchical Organization**: Organize tasks into sublists within each list
- **Real-time Sync**: Firebase Firestore integration for cross-device synchronization
- **Progress Tracking**: Visual progress indicators showing completion status
- **Collapsible UI**: Expandable/collapsible lists and sublists for better organization

### Advanced Features
- **Dark Mode**: Toggle between light and dark themes with persistence
- **Custom Defaults**: Save current state as default and reset lists to saved defaults
- **Local Storage**: Persist theme preferences and default list states
- **Responsive Design**: Mobile-friendly interface with touch interactions
- **Delete Protection**: Long-press or hover to reveal delete buttons

### User Experience
- **Intuitive Interface**: Clean, modern design with smooth animations
- **Progress Visualization**: Completion counters on lists and sublists
- **One-Click Actions**: Easy toggle, add, delete, and reset operations
- **Auto-initialization**: Automatically sets up default lists on first use

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Deployment**: Static site ready

### Project Structure
```
src/
├── components/           # React components
│   ├── TodoItem.tsx     # Individual task item with toggle/delete
│   ├── TodoList.tsx     # Main list container with actions
│   └── TodoSublist.tsx  # Collapsible sublist component
├── lib/                 # Core utilities
│   ├── firebase.ts      # Firebase configuration
│   └── initializeData.ts # Default data and initialization
├── store/              # State management
│   └── todoStore.ts    # Zustand store with Firebase integration
├── types/              # TypeScript definitions
│   └── index.ts        # Core type definitions
└── App.tsx             # Main application component
```

## 📊 Data Models

### TodoItem
```typescript
interface TodoItem {
  id: string;           // Unique identifier
  text: string;         // Task description
  completed: boolean;   // Completion status
  category?: string;    // Optional categorization
  sublist?: string;     // Optional sublist association
}
```

### TodoList
```typescript
interface TodoList {
  id: string;                              // Unique identifier
  name: string;                            // List display name
  items: TodoItem[];                       // Main list items
  sublists?: { [key: string]: TodoItem[] }; // Organized sublists
}
```

## 🔧 Core Components

### TodoStore (Zustand)
Central state management with Firebase integration:
- **Lists Management**: CRUD operations for todo lists
- **Items Management**: Add, toggle, delete items in lists/sublists
- **Persistence**: Real-time Firebase sync + local storage
- **UI State**: Dark mode, collapsible states
- **Default States**: Save/restore list defaults

### TodoList Component
Main list container featuring:
- **Header**: List name, progress counter, action buttons
- **Collapsible**: Click header to expand/collapse
- **Actions**: Save as default, reset to default, delete list
- **Add Items**: Form to add new tasks
- **Sublist Management**: Create and manage sublists

### TodoItem Component
Individual task component with:
- **Visual States**: Checkbox, strikethrough for completed
- **Interactions**: Click to toggle, hover/long-press to delete
- **Mobile Support**: Touch-friendly interactions
- **Accessibility**: Proper ARIA labels and keyboard support

### TodoSublist Component
Hierarchical organization featuring:
- **Expandable**: Click header to show/hide items
- **Progress**: Shows completion count
- **Independent**: Own add item form and item management
- **Nested Structure**: Visually distinct from main list

## 🔥 Firebase Integration

### Configuration
- **Project**: `todo-list-8465d`
- **Database**: Firestore with `lists` collection
- **Real-time**: Live updates across all connected clients
- **Offline Support**: Firestore automatically handles offline states

### Data Flow
1. App loads → Subscribe to Firestore `lists` collection
2. Empty database → Auto-initialize with default lists
3. User actions → Update local state + sync to Firebase
4. Real-time listener → Keep all clients synchronized

## 🎨 Styling & Theming

### Design System
- **Framework**: Tailwind CSS with custom configuration
- **Color Scheme**: Blue primary, gray neutrals
- **Typography**: System font stack with proper hierarchy
- **Spacing**: Consistent 4px grid system

### Dark Mode
- **Toggle**: Sun/moon icon in header
- **Persistence**: Stored in localStorage
- **Implementation**: Tailwind dark: classes with document root class toggle
- **Components**: All components support both themes

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd todo

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Firebase Setup
The app is pre-configured with Firebase. For your own deployment:
1. Create a Firebase project
2. Enable Firestore
3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
4. Update security rules if needed

## 📱 Usage Guide

### Basic Operations
1. **Create List**: Enter name in top input and click "Create List"
2. **Add Tasks**: Use the input field in any list to add items
3. **Toggle Tasks**: Click checkbox to mark complete/incomplete
4. **Delete Items**: Hover (desktop) or long-press (mobile) to reveal delete button

### Advanced Features
1. **Create Sublists**: Click "Add new sublist" button in any list
2. **Save Defaults**: Click save icon to store current state as default
3. **Reset Lists**: Click reset icon to restore to saved default
4. **Dark Mode**: Click sun/moon icon to toggle theme
5. **Collapse**: Click list header to collapse/expand

### Default Lists
The app initializes with two example lists:
- **General List**: Simple single-level todo list
- **Packing List**: Hierarchical list with sublists (Clothes, Toiletries, Electronics)

## 🔍 Key Implementation Details

### State Management
- **Zustand**: Lightweight state management with TypeScript support
- **Firebase Sync**: All state changes automatically sync to Firestore
- **Optimistic Updates**: UI updates immediately, Firebase sync happens async
- **Error Handling**: Graceful fallbacks for offline scenarios

### Performance Optimizations
- **Real-time Subscriptions**: Only subscribe to necessary Firebase collections
- **Local Storage**: Cache preferences and defaults for faster startup
- **Memoization**: React components optimized to prevent unnecessary re-renders
- **Efficient Updates**: Minimal DOM updates through proper key usage

### Mobile Considerations
- **Touch Interactions**: Long-press to delete, tap to toggle
- **Responsive Layout**: Adapts to all screen sizes
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Optimized for mobile browsers

## 🛠️ Development Notes

### Code Organization
- **Separation of Concerns**: Components, state, types, and utilities properly separated
- **TypeScript**: Full type safety throughout the application
- **Consistent Patterns**: Standardized component structure and naming
- **Reusable Components**: Components designed for reuse and extensibility

### Recent Improvements
- **Consolidated Type Definitions**: Single source of truth for all TypeScript interfaces
- **Refactored State Management**: DRY principle applied with reusable helper functions
- **Decoupled Components**: Components directly access store actions, reducing prop drilling
- **Secure Configuration**: Firebase credentials moved to environment variables
- **Performance Optimization**: useMemo for expensive calculations in TodoList component

### Testing Considerations
- Components designed for easy unit testing
- Clear separation between UI and business logic
- Mocked Firebase for testing environments
- TypeScript provides compile-time error checking

### Deployment
- **Static Site**: Built as static files, can deploy anywhere
- **Vite Optimized**: Fast builds and hot module replacement
- **Environment Variables**: Firebase config can be externalized
- **CDN Ready**: Optimized for content delivery networks

## 🔄 Future Enhancements

### Planned Features
- **User Authentication**: Multiple users with private lists
- **Collaboration**: Shared lists between users
- **Due Dates**: Task scheduling and reminders
- **Categories**: Color-coded task categorization
- **Search**: Full-text search across all lists and items
- **Export**: Export lists as PDF, CSV, or other formats

### Technical Improvements
- **Offline Support**: Enhanced offline capabilities with service workers
- **Push Notifications**: Reminders and updates
- **Data Validation**: Enhanced error handling and data validation
- **Performance**: Further optimizations for large datasets
- **Accessibility**: Enhanced screen reader and keyboard support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*This README provides a comprehensive overview of the Todo List Manager application. For questions or contributions, please refer to the project's issue tracker or contact the maintainers.* 