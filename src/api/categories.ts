import express from 'express';
import { CategoryService, CreateCategoryData, UpdateCategoryData } from '../services/categoryService';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/categories - Get all categories
router.get('/', async (req: AuthRequest, res) => {
  try {
    console.log('🏷️ Getting categories for user:', req.user.email);
    const userId = req.user._id.toString();
    const categories = await CategoryService.getCategories(userId);
    console.log(`✅ Found ${categories.length} categories`);
    res.json({ categories });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const data: CreateCategoryData = req.body;

    // Basic validation
    if (!data.name || data.name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (data.name.length > 50) {
      return res.status(400).json({ error: 'Category name must be 50 characters or less' });
    }

    const category = await CategoryService.createCategory(userId, data);
    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create category';
    res.status(400).json({ error: message });
  }
});

// GET /api/categories/:id - Get specific category
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const categoryId = req.params.id;

    const category = await CategoryService.getCategoryById(userId, categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const categoryId = req.params.id;
    const data: UpdateCategoryData = req.body;

    // Basic validation
    if (data.name && (data.name.trim().length === 0 || data.name.length > 50)) {
      return res.status(400).json({ error: 'Category name must be 1-50 characters' });
    }

    const category = await CategoryService.updateCategory(userId, categoryId, data);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update category';
    res.status(400).json({ error: message });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const categoryId = req.params.id;

    const deleted = await CategoryService.deleteCategory(userId, categoryId);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    res.status(400).json({ error: message });
  }
});

export default router;