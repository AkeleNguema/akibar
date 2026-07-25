import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import saleRoutes from './routes/saleRoutes';
import productRoutes from './routes/productRoutes';
import debtRoutes from './routes/debtRoutes';
import stockRoutes from './routes/stockRoutes';
import expenseRoutes from './routes/expenseRoutes';
import closureRoutes from './routes/closureRoutes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/closures', closureRoutes);

app.get('/', (req, res) => {
  res.send('API Akibar opérationnelle 🍺');
});

app.listen(PORT, () => {
  console.log(`Yo Animg, le serveur Akibar est lancé sur http://localhost:${PORT}`);
});