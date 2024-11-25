const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./db/conn');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Connect to the database
connectDB();

const Task = require('./db/taskModel');

app.get('/', async (req, res) => {
    try {
        // Fetch tasks from the database (for the demo, we use all tasks)
        const tasks = await Task.find();
        res.render('dashboard', { tasks });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Default route for the home page
app.get('/', (req, res) => {
    res.render('dashboard', { title: 'TaskMaster Dashboard' });
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

