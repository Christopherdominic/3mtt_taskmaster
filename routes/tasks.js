const express = require('express');
const Task = require('../db/taskModel');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticateJWT, async (req, res) => {
    try {
        const { title, description, priority, deadline } = req.body;
        const newTask = new Task({ userID: req.user.id, title, description, priority, deadline });
        await newTask.save();
        res.status(201).json({ message: 'Task created successfully!', task: newTask });
    } catch (error) {
        res.status(400).json({ error: 'Task creation failed!' });
    }
});

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const tasks = await Task.find({ userID: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch tasks!' });
    }
});

router.put('/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await Task.findOneAndUpdate({ _id: id, userID: req.user.id }, updates, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found!' });
        res.json({ message: 'Task updated successfully!', task });
    } catch (error) {
        res.status(400).json({ error: 'Task update failed!' });
    }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndDelete({ _id: id, userID: req.user.id });
        if (!task) return res.status(404).json({ error: 'Task not found!' });
        res.json({ message: 'Task deleted successfully!' });
    } catch (error) {
        res.status(400).json({ error: 'Task deletion failed!' });
    }
});

// Create a new task
router.post('/create', async (req, res) => {
    try {
        const { title, description, priority, deadline } = req.body;
        const newTask = new Task({ title, description, priority, deadline });
        await newTask.save();
        res.redirect('/'); // Redirect to the dashboard after creating the task
    } catch (error) {
        console.error(error);
        res.status(400).send('Failed to create task');
    }
});


module.exports = router;
