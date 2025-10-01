import express from 'express';
import { TodoService, CreateTodoData, UpdateTodoData, TodoFilters } from '../services/todoService';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/todos - Get all todos with optional filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    console.log('📋 Getting todos for user:', req.user.email);
    const userId = req.user._id.toString();
    const filters: TodoFilters = {};

    // Parse query parameters
    if (req.query.status) {
      filters.status = req.query.status as 'pending' | 'completed';
    }

    if (req.query.priority) {
      filters.priority = req.query.priority as 'low' | 'medium' | 'high';
    }

    if (req.query.category) {
      filters.category = req.query.category as string;
    }

    if (req.query.due_date_start) {
      filters.due_date_start = new Date(req.query.due_date_start as string);
    }

    if (req.query.due_date_end) {
      filters.due_date_end = new Date(req.query.due_date_end as string);
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    const todos = await TodoService.getTodos(userId, filters);
    res.json({ todos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to get todos' });
  }
});

// POST /api/todos - Create new todo
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const data: CreateTodoData = req.body;

    // Basic validation
    if (!data.title || data.title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = await TodoService.createTodo(userId, data);
    res.status(201).json({ todo });
  } catch (error) {
    console.error('Create todo error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create todo';
    res.status(400).json({ error: message });
  }
});

// GET /api/todos/:id - Get specific todo
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const todoId = req.params.id;

    const todo = await TodoService.getTodoById(userId, todoId);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ todo });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Failed to get todo' });
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const todoId = req.params.id;
    const data: UpdateTodoData = req.body;

    const todo = await TodoService.updateTodo(userId, todoId, data);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ todo });
  } catch (error) {
    console.error('Update todo error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update todo';
    res.status(400).json({ error: message });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const todoId = req.params.id;

    const deleted = await TodoService.deleteTodo(userId, todoId);
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// PATCH /api/todos/:id/toggle - Toggle todo status
router.patch('/:id/toggle', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const todoId = req.params.id;

    const todo = await TodoService.toggleTodoStatus(userId, todoId);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ todo });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ error: 'Failed to toggle todo status' });
  }
});

// GET /api/todos/overdue - Get overdue todos
router.get('/overdue', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const todos = await TodoService.getOverdueTodos(userId);
    res.json({ todos });
  } catch (error) {
    console.error('Get overdue todos error:', error);
    res.status(500).json({ error: 'Failed to get overdue todos' });
  }
});

export default router;