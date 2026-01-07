const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration - Optimized for Mobile & Cross-Environment
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'https://expirio-08f52c30.vercel.app',
    process.env.CLIENT_URL,
].filter(origin => origin); // Remove empty values

const corsOptions = {
    origin: (origin, callback) => {
        // 1. Allow non-browser requests (Postman, Mobile Apps, or same-origin)
        if (!origin) return callback(null, true);

        // 2. Check if the origin is in our whitelist
        const isAllowed = allowedOrigins.includes(origin);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`🛑 [CORS Blocked] Origin: ${origin}`);
            callback(new Error('Cross-Origin Request Blocked by Expirio Security Policy'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 86400, // Cache preflight results for 24 hours
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Robust preflight handling


app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Passport Middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
console.log("🛠️  Registering Review Routes...");
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is connected', timestamp: new Date() });
});

// Root Route
app.get('/', (req, res) => {
    res.send('Expirio API is running...');
});

// Error Handler
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
