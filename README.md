# Travel Property Management System (PMS)

A comprehensive microservices-based Travel Property Management System built with Node.js, TypeScript, and modern web technologies.

## 🏗️ Architecture Overview

This project follows a microservices architecture with separate frontend and backend applications:

### Backend Services (Port 3001-3004)
- **Super Admin Service** (Port 3001) - API Gateway and admin management
- **Vendor Dashboard Service** (Port 3002) - Vendor management and operations
- **Hotel Management Service** (Port 3003) - Hotel and room management
- **Booking Website Service** (Port 3004) - Public booking interface

### Frontend Applications
- **Super Admin Dashboard** - Administrative interface
- **Vendor Dashboard** - Vendor management interface
- **Hotel Management** - Hotel operations interface
- **Booking Website** - Public booking interface

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/meghdeth/travel-pms.git
   cd travel-pms
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Copy environment template
   cp Backend/.env.example Backend/.env
   
   # Configure your environment variables
   # Edit Backend/.env with your database and service configurations
   ```

5. **Start Development Servers**
   ```bash
   # Start all backend services
   cd Backend
   npm run dev:all
   
   # Start frontend applications (in separate terminal)
   cd Frontend
   npm run dev
   ```

## 📁 Project Structure

```
Travel-PMS/
├── Backend/
│   ├── services/
│   │   ├── super-admin-service/     # API Gateway & Admin
│   │   ├── vendor-service/          # Vendor Management
│   │   ├── hotel-service/           # Hotel Operations
│   │   └── booking-service/         # Public Bookings
│   ├── shared/                      # Shared utilities
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── utils/                   # Common utilities
│   │   ├── middleware/              # Shared middleware
│   │   └── constants/               # Application constants
│   └── legacy/                      # Legacy monolithic code
├── Frontend/
│   ├── apps/
│   │   ├── super-admin/            # Admin Dashboard
│   │   ├── vendor-dashboard/       # Vendor Interface
│   │   ├── hotel-management/       # Hotel Management
│   │   └── booking-website/        # Public Booking Site
│   └── packages/
│       ├── shared/                 # Shared components
│       ├── ui/                     # UI component library
│       └── templates/              # Reusable templates
└── database/
    └── schema.sql                  # Database schema
```

## 🛠️ Development

### Backend Services

Each backend service is independently deployable and has its own:
- **Routes** - API endpoints
- **Controllers** - Business logic
- **Models** - Data models
- **Middleware** - Service-specific middleware
- **Utils** - Service utilities

### Shared Components

The `Backend/shared/` directory contains:
- **Types** - TypeScript interfaces for inter-service communication
- **Utils** - Database utilities, service clients, validation
- **Middleware** - Authentication, authorization, error handling
- **Constants** - HTTP status codes, error messages, configurations

### Available Scripts

#### Backend
```bash
npm run dev:all          # Start all services in development
npm run dev:super-admin  # Start super admin service only
npm run dev:vendor       # Start vendor service only
npm run dev:hotel        # Start hotel service only
npm run dev:booking      # Start booking service only
npm run build           # Build all services
npm run test            # Run tests
```

#### Frontend
```bash
npm run dev             # Start all frontend apps
npm run build           # Build all apps
npm run test            # Run tests
npm run lint            # Run linting
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/travel-pms

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Services
SUPER_ADMIN_PORT=3001
VENDOR_SERVICE_PORT=3002
HOTEL_SERVICE_PORT=3003
BOOKING_SERVICE_PORT=3004

# External APIs
PAYMENT_GATEWAY_URL=
EMAIL_SERVICE_URL=
SMS_SERVICE_URL=

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
```

## 🗄️ Database Schema

The system uses MongoDB with the following main collections:
- **users** - User accounts and authentication
- **vendors** - Vendor information and settings
- **hotels** - Hotel properties and details
- **rooms** - Room types and availability
- **bookings** - Booking records and status
- **payments** - Payment transactions
- **reviews** - Customer reviews and ratings

## 🔐 Authentication & Authorization

- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Super Admin, Vendor, Hotel Manager, Customer)
- **Service-to-service authentication** for inter-service communication
- **Rate limiting** and security middleware

## 📡 API Documentation

### Service Endpoints

#### Super Admin Service (Port 3001)
- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/login` - Admin login
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/vendors` - Manage vendors
- `GET /api/v1/hotels` - Manage hotels

#### Vendor Service (Port 3002)
- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/login` - Vendor login
- `GET /api/v1/dashboard` - Vendor dashboard
- `GET /api/v1/hotels` - Vendor's hotels
- `GET /api/v1/bookings` - Vendor's bookings

#### Hotel Service (Port 3003)
- `GET /api/v1/health` - Health check
- `GET /api/v1/hotels` - Hotel management
- `GET /api/v1/rooms` - Room management
- `POST /api/v1/hotels` - Create hotel
- `PUT /api/v1/hotels/:id` - Update hotel

#### Booking Service (Port 3004)
- `GET /api/v1/health` - Health check
- `GET /api/v1/search` - Search hotels
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking details

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific service tests
npm run test:hotel
npm run test:booking
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Scale services
docker-compose up -d --scale hotel-service=3
```

### Production Deployment

1. **Build the applications**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Deploy to your preferred platform** (AWS, Google Cloud, Azure, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Update documentation for new features
- Ensure all services pass health checks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation

## 🔄 Migration from Legacy System

This project includes migration utilities to move from the legacy monolithic system:

1. **Data Migration** - Scripts to migrate existing data
2. **API Compatibility** - Backward compatibility layers
3. **Gradual Migration** - Step-by-step migration guide

## 📊 Monitoring & Logging

- **Winston** for structured logging
- **Health check endpoints** for service monitoring
- **Error tracking** and reporting
- **Performance metrics** collection

## 🔧 Troubleshooting

### Common Issues

1. **Service won't start**
   - Check port availability
   - Verify environment variables
   - Check database connection

2. **Database connection issues**
   - Verify MongoDB is running
   - Check connection string
   - Ensure database exists

3. **Inter-service communication fails**
   - Check service health endpoints
   - Verify service discovery configuration
   - Check network connectivity

---

**Built with ❤️ for the travel industry**