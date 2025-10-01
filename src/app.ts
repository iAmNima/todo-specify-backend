import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (only for local development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Debug: Check if JWT_SECRET is loaded
console.log('🔐 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins temporarily to test
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
import authRoutes from './api/auth';
import todoRoutes from './api/todos';
import categoryRoutes from './api/categories';

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch(console.error);

export default app;