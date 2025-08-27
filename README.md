# Seatzy

A modern movie booking platform built with React and Node.js.

## Features

- Browse and search movies
- Select theaters and showtimes
- Book seats with interactive seat selection
- User authentication and profile management
- Admin panel for movie and theater management
- Partner portal for theater owners
- Secure payment processing

## Tech Stack

**Frontend:**
- React.js
- Redux Toolkit
- Ant Design
- Stripe (Payment Processing)

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd seatzy
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables
Create a `.env` file in the server directory with your configuration.

5. Start the development servers
```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

- `/client` - React frontend application
- `/server` - Node.js backend API
- `/server/models` - MongoDB schemas
- `/server/routes` - API routes
- `/server/controllers` - Business logic
- `/client/src/pages` - React page components
- `/client/src/components` - Reusable React components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.