# 🏗️ Seatzy Architecture Documentation

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │    │   Express API    │    │   MongoDB       │
│   (Port 3000)   │◄──►│   (Port 8082)    │◄──►│   Database      │
│                 │    │                  │    │                 │
│ - Redux Store   │    │ - JWT Auth       │    │ - User Data     │
│ - Ant Design    │    │ - Route Handlers │    │ - Movie Catalog │
│ - Axios API     │    │ - Middleware     │    │ - Bookings      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │                       │
            ┌───────▼────────┐    ┌────────▼────────┐
            │ Stripe Payment │    │ Nodemailer SMTP │
            │   Processing   │    │ Email Service   │
            └────────────────┘    └─────────────────┘
```

## Data Flow Architecture

### User Authentication Flow
```
User Login → JWT Token Generation → Token Storage → Protected Route Access
     │              │                      │                    │
     ▼              ▼                      ▼                    ▼
Form Input → bcrypt Verification → localStorage → Header Authorization
```

### Booking Flow
```
Movie Selection → Theater Choice → Seat Selection → Payment → Confirmation
       │               │              │             │           │
       ▼               ▼              ▼             ▼           ▼
  Movie API → Show API → Seat API → Stripe API → Booking API
```

## Component Hierarchy

### Frontend Component Structure
```
App
├── ProtectedRoute (Auth wrapper)
│   ├── Header (Navigation & User menu)
│   ├── Home (Movie browsing)
│   │   ├── MovieCard
│   │   └── SearchFilters
│   ├── MovieDetails
│   │   ├── ShowTimings
│   │   └── SeatSelection
│   ├── Profile (User dashboard)
│   ├── Partner (Theater management)
│   │   ├── TheatreList
│   │   ├── TheatreFormModal
│   │   └── ShowModal
│   └── Admin (Platform management)
└── Auth Routes
    ├── Login
    └── Register
```

## API Endpoint Structure

### Authentication Routes (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /get-current-user` - Get authenticated user info

### Movie Routes (`/api/movies`)
- `GET /get-all-movies` - Fetch all movies
- `POST /add-movie` - Add new movie (Admin)
- `PUT /update-movie` - Update movie (Admin)
- `DELETE /delete-movie` - Delete movie (Admin)

### Theater Routes (`/api/theatres`)
- `GET /get-all-theatres` - Fetch theaters
- `POST /add-theatre` - Add theater (Partner)
- `PUT /update-theatre` - Update theater (Partner)
- `DELETE /delete-theatre` - Delete theater (Partner)

### Show Routes (`/api/shows`)
- `GET /get-all-shows` - Fetch shows by theater/movie
- `POST /add-show` - Add show (Partner)
- `PUT /update-show` - Update show (Partner)
- `DELETE /delete-show` - Delete show (Partner)

### Booking Routes (`/api/bookings`)
- `POST /make-payment` - Process payment via Stripe
- `POST /book-show` - Create booking record
- `GET /get-bookings` - Fetch user bookings

## Security Implementation

### Authentication & Authorization
```
Request → Auth Middleware → JWT Verification → Role Check → Route Access
   │            │               │                │            │
   ▼            ▼               ▼                ▼            ▼
Headers → Extract Token → Verify Secret → Check Role → Allow/Deny
```

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation and verification
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: API request throttling

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['user', 'partner', 'admin'],
  isActive: Boolean,
  createdAt: Date
}
```

### Movie Model
```javascript
{
  title: String,
  description: String,
  genre: String,
  language: String,
  duration: Number,
  releaseDate: Date,
  poster: String,
  rating: Number,
  isActive: Boolean
}
```

### Theater Model
```javascript
{
  name: String,
  address: String,
  email: String,
  phone: String,
  owner: ObjectId (User),
  isActive: Boolean,
  createdAt: Date
}
```

### Show Model
```javascript
{
  movie: ObjectId (Movie),
  theatre: ObjectId (Theater),
  date: Date,
  time: String,
  ticketPrice: Number,
  totalSeats: Number,
  bookedSeats: [String],
  isActive: Boolean
}
```

### Booking Model
```javascript
{
  user: ObjectId (User),
  show: ObjectId (Show),
  seats: [String],
  transactionId: String,
  totalAmount: Number,
  bookingDate: Date,
  status: Enum ['confirmed', 'cancelled']
}
```

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy loading of route components
- **State Management**: Optimized Redux store structure
- **Caching**: API response caching with proper invalidation
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimization
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient MongoDB connections
- **Middleware Optimization**: Minimal middleware stack
- **Error Handling**: Comprehensive error management

### Scalability Features
- **Horizontal Scaling**: Stateless server design
- **Database Sharding**: Preparation for data partitioning
- **CDN Integration**: Static asset optimization
- **Load Balancing**: Ready for multi-instance deployment