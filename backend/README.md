# E-Sport Connection Backend

A robust Express.js backend API for the E-Sport Connection application, built with TypeScript, MongoDB, and JWT authentication.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **CORS** - Cross-origin resource sharing support
- **Helmet** - Security headers middleware
- **Morgan** - HTTP request logger
- **Environment Variables** - Secure configuration management

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection configuration
├── controllers/
│   └── userController.ts    # User-related business logic
├── middleware/
│   └── auth.ts             # JWT authentication middleware
├── models/
│   └── User.ts             # User data model
├── routes/
│   └── userRoutes.ts       # User API routes
├── utils/                  # Utility functions
└── index.ts               # Main server entry point
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/e-sport-connection
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/profile` - Get user profile (protected)
- `PUT /api/v1/users/profile` - Update user profile (protected)

### Health Check
- `GET /health` - Server health status

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **JWT** - Secure authentication
- **Password Hashing** - Bcrypt encryption
- **Input Validation** - Request data validation
- **Rate Limiting** - API rate limiting (to be implemented)

## 📊 Database Schema

### User Model
- `username` (required, unique)
- `email` (required, unique)
- `password` (required, hashed)
- `firstName` (optional)
- `lastName` (optional)
- `avatar` (optional)
- `bio` (optional)
- `isVerified` (boolean, default: false)
- `role` (enum: user, admin, moderator, default: user)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/e-sport-connection |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `JWT_SECRET` | JWT signing secret | fallback-secret |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License. 