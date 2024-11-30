const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_KEY = 'supersecretkey';

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'task_management';
let db, usersCollection, tasksCollection;

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    usersCollection = db.collection('users');
    tasksCollection = db.collection('tasks');
    console.log('Connected to MongoDB Database');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login.html');
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.redirect('/login.html');
        req.userId = decoded.id;
        next();
    });
}

// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        await usersCollection.insertOne({ username, email, password: hashedPassword });
        res.redirect('/login.html');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Server error');
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await usersCollection.findOne({ email });
        if (!user) return res.redirect('/login.html?error=1');

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.redirect('/login.html?error=1');

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: 86400 });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard.html');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error');
    }
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login.html');
});

// Get all tasks for the logged-in user
app.get('/tasks', verifyToken, async (req, res) => {
    try {
        const tasks = await tasksCollection.find({ user_id: req.userId }).toArray();
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Server error');
    }
});

// Create a new task
app.post('/tasks/create', verifyToken, async (req, res) => {
    const { title, description, due_date, status } = req.body;
    
    try {
        await tasksCollection.insertOne({
            title,
            description,
            due_date,
            status,
            user_id: req.userId
        });
        res.redirect('/dashboard.html');
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).send('Server error');
    }
});

// Update a task
app.post('/tasks/update/:id', verifyToken, async (req, res) => {
    const { title, description, due_date, status } = req.body;
    const taskId = req.params.id;

    if (!title || !description || !due_date || !status) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const result = await tasksCollection.updateOne(
            { _id: new require('mongodb').ObjectId(taskId), user_id: req.userId },
            { $set: { title, description, due_date, status } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).send('Task not found');
        }
        res.redirect('/dashboard.html');
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Server error');
    }
});

// Delete a task
app.post('/tasks/delete/:id', verifyToken, async (req, res) => {
    const taskId = req.params.id;

    try {
        const result = await tasksCollection.deleteOne({ _id: new require('mongodb').ObjectId(taskId), user_id: req.userId });
        if (result.deletedCount === 0) {
            return res.status(404).send('Task not found');
        }
        res.redirect('/dashboard.html');
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).send('Server error');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

