import { Category, ICategory } from '../models/Category';

export interface CreateCategoryData {
  name: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
}

export class CategoryService {
  static async createCategory(userId: string, data: CreateCategoryData): Promise<ICategory> {
    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name: data.name,
      user_id: userId
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = new Category({
      ...data,
      user_id: userId
    });

    await category.save();
    return category;
  }

  static async getCategories(userId: string): Promise<ICategory[]> {
    return Category.find({ user_id: userId }).sort({ name: 1 });
  }

  static async getCategoryById(userId: string, categoryId: string): Promise<ICategory | null> {
    return Category.findOne({ _id: categoryId, user_id: userId });
  }

  static async updateCategory(userId: string, categoryId: string, data: UpdateCategoryData): Promise<ICategory | null> {
    // Check if new name conflicts with existing category
    if (data.name) {
      const existingCategory = await Category.findOne({
        name: data.name,
        user_id: userId,
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, user_id: userId },
      data,
      { new: true }
    );

    return category;
  }

  static async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    // Check if category is being used by any todos
    const { Todo } = await import('../models/Todo');
    const todosUsingCategory = await Todo.countDocuments({
      user_id: userId,
      category: await this.getCategoryName(userId, categoryId)
    });

    if (todosUsingCategory > 0) {
      throw new Error('Cannot delete category that is being used by todos');
    }

    const result = await Category.deleteOne({ _id: categoryId, user_id: userId });
    return result.deletedCount > 0;
  }

  static async getCategoryName(userId: string, categoryId: string): Promise<string | null> {
    const category = await Category.findOne({ _id: categoryId, user_id: userId });
    return category ? category.name : null;
  }

  static async categoryExists(userId: string, categoryName: string): Promise<boolean> {
    const category = await Category.findOne({ name: categoryName, user_id: userId });
    return !!category;
  }
}