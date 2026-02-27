const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config();

const isServerless = !!process.env.VERCEL;

const { connectDB, disconnectDB } = require('./config/db.js');
const userRoutes = require('./routes/user.route.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const quizRoutes = require('./routes/quiz.route.js');
const noteRoutes = require('./routes/noteRoutes.js');
const ResourceRoute = require('./routes/ResourceRoutes.js');
const CategoryRoutes = require('./routes/categoryRoutes.js');
const documentRoutes = require('./routes/documentRoutes.js');
const assetCategoryRoutes = require('./routes/assetCategory.js');
const assetRoutes = require('./routes/asset.js');
const infouploadRoutes = require('./routes/infoupload.route.js');
const buyerRoutes = require('./routes/buyerRoutes.js');
const sellerRoutes = require('./routes/sellerRoutes.js');
const b2bMatchingRoutes = require('./routes/b2bMatchingRoutes.js');
const savedMatchRoutes = require('./routes/savedMatchRoutes.js');
const trainingFollowupRoutes = require('./routes/trainingFollowupRoutes.js');
const ensraFollowupRoutes = require('./routes/ensraFollowupRoutes.js');
const packageRoutes = require('./routes/packageRoutes.js');
const serviceTypeRoutes = require('./routes/serviceTypeRoutes.js');
const metricRoutes = require('./routes/metricRoutes.js');
const tradexFollowupRoutes = require('./routes/tradexFollowupRoutes.js');
const stockRoutes = require('./routes/stockRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const itRoutes = require('./routes/itRoutes.js');
const demandRoutes = require('./routes/demandRoutes.js');
const awardRoutes = require('./routes/awardRoutes.js');

const consultancyRoutes = require('./routes/consultancyRoutes.js');

const costRoutes = require('./routes/costRoutes.js');
const requestRoutes = require('./routes/requestRoutes.js');
const actionItemRoutes = require('./routes/actionItemRoutes.js');
const employerProfileRoutes = require('./routes/employerProfileRoutes.js');
const employerDetailsRoutes = require('./routes/employerDetailsRoutes.js');
const registrationAnalyticsRoutes = require('./routes/registrationAnalyticsRoutes.js');
const jobRoutes = require('./routes/jobRoutes.js');
const telegramRoutes = require('./routes/telegramRoutes.js');
const partnerCompanyRoutes = require('./routes/partnerCompanyRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const employerCategoryRoutes = require('./routes/employerCategoryRoutes.js');
const favoritesRoutes = require('./routes/favoritesRoutes.js');
const scholarshipAuthRoutes = require('./routes/scholarshipAuthRoutes.js');
const smsAuthRoutes = require('./routes/smsAuthRoutes.js');
const scholarshipContentRoutes = require('./routes/scholarshipContentRoutes.js');
const { initSmppHandlers } = require('./services/subscriptionService');
// Load environment variables

// Initialize Express app
const app = express();

// Store connected users
const connectedUsers = new Map();

const createNoopIo = () => ({
  to: () => ({ emit: () => {} }),
  emit: () => {},
  on: () => {}
});

let io = createNoopIo();
let server;

if (!isServerless) {
  const http = require('http');
  const socketIo = require('socket.io');

  server = http.createServer(app);
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Register user with their ID
    socket.on('registerUser', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove user from connected users map
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });
}

// Make io available to other modules
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// CORS configuration
const normalizeOrigin = (value) => {
  if (!value || typeof value !== 'string') return [];
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return [];

  if (trimmed.includes('://')) {
    return [trimmed];
  }

  // Allow host-only values in env by expanding to both protocols.
  return [`https://${trimmed}`, `http://${trimmed}`];
};

const parseOriginsEnv = (...values) =>
  values
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .flatMap((value) => value.split(','))
    .flatMap((value) => normalizeOrigin(value));

const configuredOrigins = parseOriginsEnv(
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGINS,
  process.env.CLIENT_URL,
  process.env.CLIENT_ORIGIN,
  process.env.APP_URL,
  process.env.PUBLIC_URL
);

const localDevOrigins = [
  'http://enisra.com',
  'https://enisra.com',
  'https://www.enisra.com',
  'http://174.129146.82',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004'
];

const allowedOrigins = [...new Set([...configuredOrigins, ...localDevOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === 'null') return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname, origin: normalizedOrigin } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (allowedOrigins.includes(normalizedOrigin)) return true;
  } catch (error) {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin);
    console.log('Allowed origins:', allowedOrigins);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  credentials: true
};


// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
// Removed static uploads directory since we're using Appwrite for file storage
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check middleware
app.use('/api/health', async (req, res) => {
  try {
    // Check if database is connected
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
      success: true,
      status: 'OK',
      database: dbStatus,
      vercel: !!process.env.VERCEL,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Add a middleware to check database connection
app.use(async (req, res, next) => {
  try {
    // Ensure database is connected
    if (!mongoose.connection.readyState) {
      console.log('Attempting to connect to database...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database connection error', 
      error: error.message,
      vercel: !!process.env.VERCEL
    });
  }
});

// Define API routes
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend server is running successfully!', 
    status: 'OK',
    timestamp: new Date(),
    service: 'Employee Portal Backend API',
    version: '1.0.0',
    vercel: !!process.env.VERCEL
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date(), 
    service: 'Employee Portal Backend',
    version: '1.0.0',
    vercel: !!process.env.VERCEL
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working correctly!', 
    status: 'OK',
    timestamp: new Date(),
    vercel: !!process.env.VERCEL
  });
});

// API Routes

app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/resources', ResourceRoute);
app.use('/api/documents', documentRoutes);
app.use('/api/assetcategories', assetCategoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api', infouploadRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/b2b', b2bMatchingRoutes);
app.use('/api/saved-matches', savedMatchRoutes);
app.use('/api/training-followups', trainingFollowupRoutes);
app.use('/api/ensra-followups', ensraFollowupRoutes);
app.use('/api/consultancies', consultancyRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api', metricRoutes);
app.use('/api/tradex-followups', tradexFollowupRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/it', itRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/demands', demandRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/social-requests', requestRoutes);
app.use('/api/action-items', actionItemRoutes);
// Awards
app.use('/api/awards', awardRoutes);

app.use('/api/employer-profile', employerProfileRoutes);
app.use('/api/employer-details', employerDetailsRoutes);
app.use('/api/employer-categories', employerCategoryRoutes);
app.use('/api/analytics/registrations', registrationAnalyticsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/telegram', telegramRoutes);
app.use('/api/partners', partnerCompanyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/scholarship-auth', scholarshipAuthRoutes);
app.use('/api', smsAuthRoutes);
app.use('/api/scholarship-content', scholarshipContentRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    vercel: !!process.env.VERCEL
  });
});

// For Vercel serverless functions, export the app directly
module.exports = app;

// Connect to MongoDB and start the server only when running locally
if (require.main === module) {
    const PORT = Number(process.env.PORT) || 5000;
    const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces by default
    
    // Connect to database and start server
    connectDB()
      .then(() => {
        initSmppHandlers();
        const httpServer = server || app;
        const maxAttempts = 50;

        const startListening = (port, attempt = 0) => {
          const onListening = () => {
            httpServer.removeListener('error', onError);
            const address = httpServer.address();
            const actualPort = typeof address === 'object' && address ? address.port : port;
            console.log(`Server running on http://${HOST}:${actualPort}`);
          };

          const onError = (e) => {
            httpServer.removeListener('listening', onListening);
            if (e.code === 'EADDRINUSE' && attempt < maxAttempts) {
              const nextPort = port + 1;
              console.log(`Port ${port} is busy, trying ${nextPort}`);
              return setImmediate(() => startListening(nextPort, attempt + 1));
            }
            console.error('HTTP server error:', e);
            process.exit(1);
          };

          httpServer.once('listening', onListening);
          httpServer.once('error', onError);
          httpServer.listen(port, HOST);
        };

        startListening(PORT);

        // Graceful shutdown
        process.on('SIGINT', async () => {
          console.log('Shutting down gracefully...');
          await disconnectDB();
          process.exit(0);
        });
      })
      .catch((error) => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
      });
}
