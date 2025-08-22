# InfantFuel Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION ENVIRONMENT                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT SIDE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Desktop       │  │    Mobile       │  │    Tablet       │                  │
│  │   Browser       │  │   Browser       │  │   Browser       │                  │
│  │                 │  │                 │  │                 │                  │
│  │ Chrome/Firefox/ │  │ Chrome/Safari/  │  │ Chrome/Safari/  │                  │
│  │ Safari/Edge     │  │ Mobile Browsers │  │ Mobile Browsers │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│                                     │                                           │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                                  HTTPS/HTTP
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────────┐
│                               NETWORK LAYER                                     │
├─────────────────────────────────────┼───────────────────────────────────────────┤
│                                     │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                             LOAD BALANCER                                   │ │
│  │                          (Nginx/CloudFlare)                                │ │
│  │                                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │    SSL      │ │   Traffic   │ │   Cache     │ │   Static    │           │ │
│  │  │ Termination │ │ Distribution│ │  Management │ │ File Serve  │           │ │
│  │  │             │ │             │ │             │ │             │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                               Load Balancing
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────────┐
│                              APPLICATION LAYER                                  │
├─────────────────────────────────────┼───────────────────────────────────────────┤
│                                     │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            WEB SERVER CLUSTER                               │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │ │
│  │  │   Server 1      │  │   Server 2      │  │   Server N      │              │ │
│  │  │                 │  │                 │  │                 │              │ │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │              │ │
│  │  │ │  Frontend   │ │  │ │  Frontend   │ │  │ │  Frontend   │ │              │ │
│  │  │ │  (React)    │ │  │ │  (React)    │ │  │ │  (React)    │ │              │ │
│  │  │ │  - Build    │ │  │ │  - Build    │ │  │ │  - Build    │ │              │ │
│  │  │ │  - Static   │ │  │ │  - Static   │ │  │ │  - Static   │ │              │ │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │              │ │
│  │  │                 │  │                 │  │                 │              │ │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │              │ │
│  │  │ │  Backend    │ │  │ │  Backend    │ │  │ │  Backend    │ │              │ │
│  │  │ │ (Node.js)   │ │  │ │ (Node.js)   │ │  │ │ (Node.js)   │ │              │ │
│  │  │ │ - Express   │ │  │ │ - Express   │ │  │ │ - Express   │ │              │ │
│  │  │ │ - API       │ │  │ │ - API       │ │  │ │ - API       │ │              │ │
│  │  │ │ - Port 3000 │ │  │ │ - Port 3001 │ │  │ │ - Port 300N │ │              │ │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │              │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           CONTAINER PLATFORM                                │ │
│  │                           (Docker/Kubernetes)                              │ │
│  │                                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │ Frontend    │ │  Backend    │ │  Database   │ │   File      │           │ │
│  │  │ Container   │ │ Container   │ │ Container   │ │ Storage     │           │ │
│  │  │             │ │             │ │             │ │ Container   │           │ │
│  │  │ - React     │ │ - Node.js   │ │ - MongoDB   │ │ - Uploads   │           │ │
│  │  │ - Nginx     │ │ - Express   │ │ - Replica   │ │ - Static    │           │ │
│  │  │ - Port 80   │ │ - Port 3000 │ │ - Port 27017│ │ - Volume    │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                               Database Connection
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────────┐
│                               DATA LAYER                                        │
├─────────────────────────────────────┼───────────────────────────────────────────┤
│                                     │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           DATABASE CLUSTER                                  │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │ │
│  │  │   Primary       │  │   Secondary     │  │   Secondary     │              │ │
│  │  │   MongoDB       │  │   MongoDB       │  │   MongoDB       │              │ │
│  │  │                 │  │                 │  │                 │              │ │
│  │  │ - Read/Write    │  │ - Read Only     │  │ - Read Only     │              │ │
│  │  │ - Port 27017    │  │ - Port 27017    │  │ - Port 27017    │              │ │
│  │  │ - Primary Node  │  │ - Replica 1     │  │ - Replica 2     │              │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │ │
│  │                                     │                                       │ │
│  │                              Replication                                    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           STORAGE LAYER                                     │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │ │
│  │  │   Database      │  │   File System   │  │   Backup        │              │ │
│  │  │   Storage       │  │   Storage       │  │   Storage       │              │ │
│  │  │                 │  │                 │  │                 │              │ │
│  │  │ - Persistent    │  │ - Uploads       │  │ - Automated     │              │ │
│  │  │ - Volumes       │  │ - Images        │  │ - Scheduled     │              │ │
│  │  │ - SSD/NVMe      │  │ - Documents     │  │ - Versioned     │              │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                                 External APIs
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                    │
├─────────────────────────────────────┼───────────────────────────────────────────┤
│                                     │                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   OpenRouter    │  │     CDN         │  │   Monitoring    │                  │
│  │   AI Service    │  │   Services      │  │   Services      │                  │
│  │                 │  │                 │  │                 │                  │
│  │ - API Gateway   │  │ - Static Assets │  │ - Uptime        │                  │
│  │ - Rate Limiting │  │ - Image Cache   │  │ - Performance   │                  │
│  │ - SSL/HTTPS     │  │ - Global Edge   │  │ - Error Track   │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Email         │  │   Analytics     │  │   Security      │                  │
│  │   Service       │  │   Service       │  │   Service       │                  │
│  │                 │  │                 │  │                 │                  │
│  │ - SMTP/API      │  │ - Google        │  │ - WAF           │                  │
│  │ - Notifications │  │ - User Behavior │  │ - DDoS Protect  │                  │
│  │ - Templates     │  │ - Performance   │  │ - SSL Certs     │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DEVELOPMENT ENVIRONMENT                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          LOCAL DEVELOPMENT                                  │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │ │
│  │  │   Developer     │  │   Frontend      │  │   Backend       │              │ │
│  │  │   Machine       │  │   Dev Server    │  │   Dev Server    │              │ │
│  │  │                 │  │                 │  │                 │              │ │
│  │  │ - VS Code       │  │ - Vite          │  │ - Nodemon       │              │ │
│  │  │ - Git           │  │ - Hot Reload    │  │ - Auto Restart  │              │ │
│  │  │ - Node.js       │  │ - Port 5173     │  │ - Port 3000     │              │ │
│  │  │ - MongoDB Local │  │                 │  │                 │              │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           CI/CD PIPELINE                                    │ │
│  │                                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │ Source      │ │   Build     │ │    Test     │ │   Deploy    │           │ │
│  │  │ Control     │ │  Process    │ │   Suite     │ │  Process    │           │ │
│  │  │             │ │             │ │             │ │             │           │ │
│  │  │ - GitHub    │ │ - npm build │ │ - Jest      │ │ - Docker    │           │ │
│  │  │ - Git Flow  │ │ - Webpack   │ │ - Cypress   │ │ - K8s       │           │ │
│  │  │ - Branches  │ │ - Optimize  │ │ - ESLint    │ │ - Auto      │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture Description

### 1. Client Layer
- **Multi-device Support**: Desktop, mobile, and tablet browsers
- **Progressive Web App**: Responsive design for all screen sizes
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge support

### 2. Network Layer
- **Load Balancer**: Nginx or CloudFlare for traffic distribution
- **SSL Termination**: HTTPS encryption and certificate management
- **CDN Integration**: Static asset delivery optimization
- **Caching Strategy**: Browser and server-side caching

### 3. Application Layer
- **Container Orchestration**: Docker containers with Kubernetes
- **Horizontal Scaling**: Multiple server instances for load distribution
- **Service Mesh**: Internal service communication
- **Health Monitoring**: Application health checks and auto-recovery

### 4. Data Layer
- **Database Clustering**: MongoDB replica set for high availability
- **Read/Write Separation**: Primary for writes, secondaries for reads
- **Data Persistence**: Persistent volumes for data storage
- **Backup Strategy**: Automated, scheduled backups with versioning

### 5. External Services
- **AI Integration**: OpenRouter API for chat functionality
- **Monitoring Stack**: Uptime, performance, and error monitoring
- **Security Services**: WAF, DDoS protection, SSL certificate management
- **Analytics Integration**: User behavior and performance tracking

## Deployment Configurations

### Production Environment
```yaml
Frontend (React):
- Build: Production optimized bundle
- Server: Nginx static file serving
- Port: 80/443 (HTTP/HTTPS)
- Caching: Browser cache + CDN

Backend (Node.js):
- Runtime: Node.js LTS
- Process Manager: PM2 or Docker
- Port: 3000 (internal)
- Environment: Production config

Database (MongoDB):
- Configuration: Replica Set (3 nodes)
- Storage: SSD with encryption
- Backup: Daily automated snapshots
- Monitoring: Performance metrics
```

### Development Environment
```yaml
Frontend:
- Development Server: Vite dev server
- Hot Module Replacement: Enabled
- Port: 5173
- Proxy: API requests to backend

Backend:
- Development Server: Nodemon
- Auto-restart: File change detection
- Port: 3000
- Database: Local MongoDB instance

Tools:
- Version Control: Git with GitHub
- Package Manager: npm
- Code Editor: VS Code
- Testing: Jest + Cypress
```

## Scaling Strategy

### Horizontal Scaling
- **Frontend**: CDN distribution + multiple edge locations
- **Backend**: Load-balanced Node.js instances
- **Database**: MongoDB sharding for large datasets

### Vertical Scaling
- **CPU**: Multi-core processing for concurrent requests
- **Memory**: Adequate RAM for caching and processing
- **Storage**: SSD/NVMe for database performance

### Auto-scaling Triggers
- **CPU Usage**: Scale when > 70% for 5 minutes
- **Memory Usage**: Scale when > 80% for 3 minutes
- **Request Rate**: Scale when > 1000 req/min per instance
