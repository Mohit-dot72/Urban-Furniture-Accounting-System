import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import contactRoutes from './modules/contacts/contacts.routes';
import productRoutes from './modules/products/products.routes';
import accountRoutes from './modules/accounts/accounts.routes';
import journalRoutes from './modules/journals/journals.routes';
import journalEntryRoutes from './modules/journalEntries/journalEntries.routes';
import analyticAccountRoutes from './modules/analyticAccounts/analyticAccounts.routes';
import budgetRoutes from './modules/budgets/budgets.routes';
import purchaseOrderRoutes from './modules/purchaseOrders/purchaseOrders.routes';
import vendorBillRoutes from './modules/vendorBills/vendorBills.routes';
import salesOrderRoutes from './modules/salesOrders/salesOrders.routes';
import customerInvoiceRoutes from './modules/customerInvoices/customerInvoices.routes';
import paymentRoutes from './modules/payments/payments.routes';
import reportRoutes from './modules/reports/reports.routes';

const app = express();

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/contacts`, contactRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/accounts`, accountRoutes);
app.use(`${API}/journals`, journalRoutes);
app.use(`${API}/journal-entries`, journalEntryRoutes);
app.use(`${API}/analytic-accounts`, analyticAccountRoutes);
app.use(`${API}/budgets`, budgetRoutes);
app.use(`${API}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API}/vendor-bills`, vendorBillRoutes);
app.use(`${API}/sales-orders`, salesOrderRoutes);
app.use(`${API}/customer-invoices`, customerInvoiceRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/reports`, reportRoutes);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
