# Q&A Platform

A full-stack question and answer platform where users can ask questions, provide answers, and interact with content. Built with modern web technologies to provide a seamless user experience.

## Features

- User authentication (Register/Login)
- Ask and answer questions
- Categorize questions
- Responsive design

## User Stories

### Authentication
- As a new user, I want to register an account so that I can ask and answer questions
- As a registered user, I want to log in to my account to access all features
- As a user, I want to stay logged in between sessions for convenience

### Questions
- As a user, I want to browse questions by category to find relevant content
- As a logged-in user, I want to post new questions to get answers from the community
- As a question author, I want to edit or delete my questions
- As a user, I want to view all answers to a question

### Answers
- As a logged-in user, I want to answer questions to help others
- As an answer author, I want to edit or delete my answers
- As a question author, I want to mark an answer as accepted

### Categories
- As a user, I want to browse questions by category
- As a user, I want to manage categories (add/edit/delete)

## Workflow

### Authentication Flow
1. User registers with email and password
2. User logs in with credentials
3. JWT token is issued and stored
4. Token is used for authenticated requests

### Question Posting Flow
1. User navigates to "Ask Question"
2. User fills in question details (title, content, category)
3. Question is saved to the database
4. Question appears in the relevant category

### Answering Flow
1. User views a question
2. User clicks "Add Answer"
3. User writes their answer and submits
4. Answer is saved and displayed below the question

### Category Management Flow
1. User navigates to categories section
2. User can add, edit, or delete categories
3. Changes are reflected across the application

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- React Query for data fetching and caching
- React Hook Form for form handling
- React Icons for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- RESTful API architecture
- CORS enabled

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or cloud instance)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Project Structure

```
techhub/
├── backend/               # Backend server code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── index.js          # Entry point
│
├── frontend/             # Frontend React application
│   ├── public/           # Static files
│   └── src/              # Source files
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── services/     # API services
│       └── App.tsx       # Main app component
│
└── README.md             # This file
```

## Available Scripts

### Backend
- `npm start` - Start the backend server
- `npm run dev` - Start in development mode with nodemon
- `npm test` - Run tests

### Frontend
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app

## Environment Variables

### Backend
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `PORT` - Port to run the server on (default: 5000)

### Frontend
- `REACT_APP_API_URL` - Backend API URL

## Deployment

### Vercel
The project is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for both frontend and backend.

1. Push your code to a GitHub repository
2. Import the repository to Vercel
3. Set up environment variables in Vercel
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Create React App
- Styled with Tailwind CSS
- Icons from React Icons
