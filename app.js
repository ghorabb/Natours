const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const hpp = require('hpp');
const { xss } = require('express-xss-sanitizer');

const tourRouter = require('./routes/TourRouters');
const userRouter = require('./routes/UserRouters');
const reviewRouter = require('./routes/ReviewRouters');
const bookingRouter = require('./routes/BookingRouters');

const AppError = require('./utils/appError');
const ErrorController = require('./controllers/ErrorController');
const connectDB = require('./db');

const app = express();

app.set('query parser', 'extended');

// 2. Ensure Database Connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(helmet());

app.use(express.json());
app.use(mongoSanitize());

app.use(xss());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests froms the same IP, try again after one hour.',
});

app.use('/api', limiter);

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  }),
);

app.use(morgan('dev'));
app.use(cookieParser());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('/{*splat}', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can not find ${req.originalUrl} at this server`,
  // });

  next(new AppError(`can not find ${req.originalUrl} at this server`, 404));
});

app.use(ErrorController);

module.exports = app;
