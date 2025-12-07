require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');


const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');


const { notFound, errorHandler } = require('./middleware/errorHandler');
require('./passport');

const app = express();

app.set('trust proxy', 1);

app.use(morgan('dev'));


app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    const query = req.query; 
    
    Object.defineProperty(req, 'query', {
        value: query,
        writable: true,
        enumerable: true,
        configurable: true
    });
    
    next();
});

app.use(mongoSanitize()); 


app.use(passport.initialize());


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api', limiter);

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 20, 
    message: 'AI Generation limit reached. Please try again later.'
});
app.use('/api/ai', aiLimiter);


app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/diagramss', require('./routes/diagrams')); 
app.use('/', require('./routes/social')); 


app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected Successfully");
    app.listen(PORT, () => console.log(` Secure Server running on port ${PORT}`));
  } catch (err) {
    console.error(" MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

connectDB();