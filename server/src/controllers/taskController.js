import { query, get, run } from '../db/database.js';

export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await query(
      `SELECT t.*, s.name as subject_name 
       FROM tasks t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       WHERE t.user_id = ? 
       ORDER BY CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.due_date ASC`,
      [userId]
    );
    return res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, due_date, priority, subject_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const result = await run(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, subject_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        title.trim(),
        description || '',
        due_date || null,
        priority || 'medium',
        subject_id || null
      ]
    );

    const createdTask = await get(
      `SELECT t.*, s.name as subject_name 
       FROM tasks t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       WHERE t.id = ?`,
      [result.id]
    );

    return res.status(201).json({ message: 'Task created successfully.', task: createdTask });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, due_date, priority, status, subject_id } = req.body;

    const existingTask = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updatedTitle = title !== undefined ? title : existingTask.title;
    const updatedDesc = description !== undefined ? description : existingTask.description;
    const updatedDueDate = due_date !== undefined ? due_date : existingTask.due_date;
    const updatedPriority = priority !== undefined ? priority : existingTask.priority;
    const updatedStatus = status !== undefined ? status : existingTask.status;
    const updatedSubjectId = subject_id !== undefined ? subject_id : existingTask.subject_id;

    await run(
      `UPDATE tasks 
       SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, subject_id = ? 
       WHERE id = ? AND user_id = ?`,
      [
        updatedTitle,
        updatedDesc,
        updatedDueDate,
        updatedPriority,
        updatedStatus,
        updatedSubjectId,
        taskId,
        userId
      ]
    );

    const updatedTask = await get(
      `SELECT t.*, s.name as subject_name 
       FROM tasks t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       WHERE t.id = ?`,
      [taskId]
    );

    return res.json({ message: 'Task updated successfully.', task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const existingTask = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    return res.json({ message: 'Task deleted successfully.', id: taskId });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
};
