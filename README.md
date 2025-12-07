# OneLastEvent

🎉 **OneLastEvent** is a modern event management platform that connects organizers and participants. Create, discover, and attend events with ease.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

## ✨ Features

- **User Authentication** - Secure JWT-based auth with refresh token rotation
- **Role-Based Access** - USER, ORGANIZER, and ADMIN roles
- **Event Management** - Create, edit, publish, and manage events
- **Registration System** - Register for free or paid events
- **Payment Processing** - Mock payments with Stripe integration ready
- **Real-time Updates** - Socket.io for live notifications
- **Modern UI** - Beautiful, responsive React frontend with Tailwind CSS
- **API Documentation** - OpenAPI/Swagger specification

## 🛠️ Tech Stack

### Backend
- Node.js 18+ with ES Modules
- Express.js
- MySQL with Sequelize ORM
- Redis for caching/session management
- JWT authentication
- Socket.io for real-time features
- Winston for logging
- Joi for validation

### Frontend
- React 18 with Vite
- React Router v6
- TanStack Query (React Query)
- Tailwind CSS
- Headless UI
- Axios

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- ESLint & Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/onelastevent.git
cd onelastevent

# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Run migrations and seed
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API Health: http://localhost:4000/api/health

### Option 2: Local Development

#### 1. Setup MySQL and Redis

Make sure MySQL and Redis are running locally.

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=onevent_user
DB_PASS=changeme
DB_NAME=onelastevent_db

# JWT (Change these in production!)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Test Accounts

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@onelastevent.com | Admin123! |
| Organizer | organizer1@example.com | Organizer1! |
| User | user1@example.com | User1234! |

## 📜 Available Scripts

### Backend

```bash
npm run dev        # Start development server with hot reload
npm run start      # Start production server
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm run test       # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting issues
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests
npm run lint       # Run ESLint
```

## 📚 API Documentation

### OpenAPI Specification

The API is documented using OpenAPI 3.0. You can find the specification at:
- `backend/swagger.json`

### Postman Collection

Import `backend/postman_collection.json` into Postman for ready-to-use API requests.

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

#### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `GET /api/users/me/inscriptions` - Get my registrations

#### Events
- `GET /api/events` - List events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Organizer)
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/publish` - Publish event
- `POST /api/events/:id/inscriptions` - Register for event

#### Payments
- `POST /api/events/:id/payments` - Initialize payment
- `POST /api/payments/:id/mock` - Process mock payment
- `POST /api/payments/webhook` - Stripe webhook

## 🏗️ Project Structure

```
onelastevent/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, Redis, Logger config
│   │   ├── controllers/   # Request handlers
│   │   ├── middlewares/   # Auth, validation, error handling
│   │   ├── models/        # Sequelize models
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helper functions
│   │   ├── validators/    # Joi schemas
│   │   └── server.js      # App entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔒 Security Features

- JWT access tokens (15min expiry) with refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Rate limiting on sensitive endpoints
- Helmet security headers
- CORS configuration
- Input validation with Joi
- SQL injection protection (Sequelize prepared statements)
- Token blacklisting on logout

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚢 Deployment

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Checklist

- [ ] Set strong JWT secrets
- [ ] Configure proper database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure Stripe keys for payments
- [ ] Set up proper logging and monitoring

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by the OneLastEvent Team

