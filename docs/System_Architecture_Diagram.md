# InfantFuel System Architecture Diagram (Basic)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                       │
│                        Web Browser | Mobile Browser | Admin Panel               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   HTTPS/HTTP
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                        │
│                               React + Vite                                      │
│                                                                                 │
│           User Interface + State Management + API Integration                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   REST API
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND LAYER                                        │
│                           Node.js + Express.js                                  │
│                                                                                 │
│              API Endpoints + Business Logic + Authentication                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                 Mongoose ODM
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER                                      │
│                                 MongoDB                                         │
│                                                                                 │
│              Users | Events | Weights | Connections | Notifications            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   Network
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                     │
│              OpenRouter AI | WHO Growth Standards | File Storage               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Simplified Architecture Overview

### 1. **Client Layer**
- Multi-platform access through web browsers and admin panel
- Responsive design for desktop, tablet, and mobile devices

### 2. **Frontend Layer (React + Vite)**
- **User Interface**: Core application features including login, profiles, tracking, calendar, and chat
- **State Management**: Redux for application state, RTK Query for API calls, React Router for navigation

### 3. **Backend Layer (Node.js + Express)**
- **API Endpoints**: RESTful services for all major functionalities
- **Business Logic**: Authentication, user management, data processing, and external service integration

### 4. **Database Layer (MongoDB)**
- **Collections**: Organized data storage for users, events, weights, connections, and notifications
- **Data Models**: Structured schemas for all application entities

### 5. **External Services**
- **OpenRouter AI**: Natural language chat support
- **WHO Growth Standards**: Health tracking reference data
- **File Storage**: Media and document management

## Key Features
- **Real-time Notifications**: Live updates for connections and events
- **Growth Tracking**: WHO standards-based infant development monitoring
- **Network Connections**: Healthcare provider-parent relationship management
- **AI Chat Support**: Intelligent FAQ and support system
- **File Management**: Secure upload and storage of images and documents

## Technology Stack
- **Frontend**: React 18, Redux Toolkit, Vite, TailwindCSS
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB with Mongoose ODM
- **External**: OpenRouter AI API, WHO Growth Data
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          CONTROLLER LAYER                                  │ │
│  │             
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         SERVICE/UTILITY LAYER                              │ │
│  │         
│  │ 
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   Mongoose ODM
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            MODEL LAYER                                      │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │ User Model  │ │ Event Model │ │Weight Model │ │ Connection  │           │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           DATABASE LAYER                                    │ │
│  │                                                                             │ │
│  │                         ┌─────────────────┐                                 │ │
│  │                         │   MongoDB       │                                 │ │
│  │                         │   Database      │                                 │ │
│  │                         │                 │                                 │ │
│  │                         │ ┌─────────────┐ │                                 │ │
│  │                         │ │Collections: │ │                                 │ │
│  │                         │ │ - users     │ │                                 │ │
│  │                         │ │ - events    │ │                                 │ │
│  │                         │ │ - weights   │ │                                 │ │
│  │                         │ │ - connections│ │                                 │ │
│  │                         │ │ - notifications│ │                               │ │
│  │                         │ └─────────────┘ │                                 │ │
│  │                         └─────────────────┘                                 │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   Network
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   OpenRouter    │  │   WHO Growth    │  │   File Storage  │                  │
│  │   AI Service    │  │   Standards     │  │   Local System  │                  │
│  │   - Chat API    │  │   - Percentiles │  │   - Images      │                  │
│  │   - Responses   │  │   - Charts      │  │   - Documents   │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Components Description

### 1. Presentation Layer
- **Web/Mobile Browsers**: Primary user interface access points
- **Future Mobile App**: Planned mobile application
- **Admin Panel**: Administrative interface

### 2. Frontend Layer (React + Vite)
- **UI Components**: Reusable React components (Navbar, Footer, Modal, etc.)
- **Pages**: Route-specific page components
- **State Management**: Redux Toolkit for application state
- **API Integration**: RTK Query for data fetching and caching

### 3. Backend Layer (Node.js + Express)
- **Middleware**: Authentication, CORS, parsing, file upload
- **Routes**: RESTful API endpoints organization
- **Controllers**: Business logic implementation
- **Services**: Utility functions and shared logic

### 4. Data Layer
- **Models**: Mongoose schemas and data validation
- **Database**: MongoDB for persistent data storage
- **Collections**: Organized data structures

### 5. External Services
- **OpenRouter AI**: Chat functionality
- **WHO Growth Standards**: Growth tracking reference data
- **Local File Storage**: Media and document management

## Key Technologies Used

- **Frontend**: React 18, Redux Toolkit, Vite, TailwindCSS, Ant Design
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Charts**: Chart.js, FullCalendar
- **AI Integration**: OpenRouter API
