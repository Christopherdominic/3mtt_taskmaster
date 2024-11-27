const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./db/conn');
const { authenticateJWT } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Debugging the loaded environment variables
console.log('Environment Variables:', {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
});

// Initialize the app
const app = express();

// Connect to the database
connectDB();

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: req.user || null });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

