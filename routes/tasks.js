const express = require('express');
const Task = require('../db/taskModel');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Create a new task
router.post('/create', authenticateJWT, async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const newTask = new Task({
            userID: req.user.id,
            title,
            description,
            priority,
        });
        await newTask.save();
        res.status(201).json({ message: 'Task created successfully' });
    } catch (err) {
        console.error('Task creation error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a task
router.put('/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { title, description, priority },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task updated successfully', task: updatedTask });
    } catch (err) {
        console.error('Task update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a task
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Task deletion error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

