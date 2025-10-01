import { Todo, ITodo } from '../models/Todo';
import { Category } from '../models/Category';
import mongoose from 'mongoose';

export interface CreateTodoData {
  title: string;
  description?: string;
  due_date?: Date;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  due_date?: Date;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  status?: 'pending' | 'completed';
}

export interface TodoFilters {
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date_start?: Date;
  due_date_end?: Date;
  search?: string;
}

export class TodoService {
  static async createTodo(userId: string, data: CreateTodoData): Promise<ITodo> {
    // Validate category if provided
    if (data.category) {
      const category = await Category.findOne({ name: data.category, user_id: userId });
      if (!category) {
        throw new Error('Category not found');
      }
    }

    const todo = new Todo({
      ...data,
      user_id: userId
    });

    await todo.save();
    return todo;
  }

  static async getTodos(userId: string, filters: TodoFilters = {}): Promise<ITodo[]> {
    const query: any = { user_id: userId };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.due_date_start || filters.due_date_end) {
      query.due_date = {};
      if (filters.due_date_start) {
        query.due_date.$gte = filters.due_date_start;
      }
      if (filters.due_date_end) {
        query.due_date.$lte = filters.due_date_end;
      }
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return Todo.find(query).sort({ created_at: -1 });
  }

  static async getTodoById(userId: string, todoId: string): Promise<ITodo | null> {
    return Todo.findOne({ _id: todoId, user_id: userId });
  }

  static async updateTodo(userId: string, todoId: string, data: UpdateTodoData): Promise<ITodo | null> {
    // Validate category if provided
    if (data.category) {
      const category = await Category.findOne({ name: data.category, user_id: userId });
      if (!category) {
        throw new Error('Category not found');
      }
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, user_id: userId },
      { ...data, updated_at: new Date() },
      { new: true }
    );

    return todo;
  }

  static async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    const result = await Todo.deleteOne({ _id: todoId, user_id: userId });
    return result.deletedCount > 0;
  }

  static async toggleTodoStatus(userId: string, todoId: string): Promise<ITodo | null> {
    const todo = await Todo.findOne({ _id: todoId, user_id: userId });
    if (!todo) {
      return null;
    }

    todo.status = todo.status === 'pending' ? 'completed' : 'pending';
    todo.updated_at = new Date();
    await todo.save();

    return todo;
  }

  static async getTodosByCategory(userId: string, category: string): Promise<ITodo[]> {
    return Todo.find({ user_id: userId, category }).sort({ created_at: -1 });
  }

  static async getOverdueTodos(userId: string): Promise<ITodo[]> {
    return Todo.find({
      user_id: userId,
      status: 'pending',
      due_date: { $lt: new Date() }
    }).sort({ due_date: 1 });
  }
}