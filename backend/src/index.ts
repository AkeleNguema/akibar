import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import saleRoutes from './routes/saleRoutes';
import expenseRoutes from './routes/expenseRoutes';
import stockRoutes from './routes/stockRoutes';
import closureRoutes from './routes/closureRoutes';
import debtRoutes from './routes/debtRoutes';
import tableRoutes from './routes/tableRoutes';
import adminRoutes from './routes/adminRoutes';
import consigneRoutes from './routes/consigneRoutes';
import ownerRoutes from './routes/ownerRoutes';
dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;

// Security and Rate Limiting
app.use(helmet()); // Adds CSP, HSTS, X-Frame-Options, etc.
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api/', apiLimiter);

// Ajout des routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/closures', closureRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consignes', consigneRoutes);
app.use('/api/owner', ownerRoutes);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('API Akibar opérationnelle 🍺');
});

// Redirection 404 (Pour SPA ou erreurs non capturées)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Dans un vrai environnement de prod, on servirait l'index.html de React
  // res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  res.status(404).json({ error: 'Route non trouvée. Si vous cherchez le frontend, assurez-vous qu\'il est lancé.' });
});

// Global error handler for monitoring errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[Error] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur interne du serveur est survenue.' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Yo Animg, le serveur Akibar est lancé sur http://127.0.0.1:${PORT}`);
});