const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/BookingModel');
const Tour = require('../models/TourModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asynchandler');

const { updateParticipants } = require('./UpdateParticipants');

// Create Booking
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { tourId } = req.params;
  const { paymentMethod, dateId } = req.body;

  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  if (!['cash', 'card'].includes(paymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  // Check the selected date and increase participants
  await updateParticipants(tourId, dateId, true);

  // Create booking
  const booking = await Booking.create({
    tour: tourId,
    user: req.user._id,
    date: dateId,
    price: tour.price,
    paymentMethod,
    paid: false,
    status: 'pending',
  });

  // If cash → we're finished
  if (paymentMethod === 'cash') {
    return res.status(201).json({
      status: 'success',
      data: {
        booking,
      },
    });
  }

  // If card → create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: 'https://www.google.com/',
    cancel_url: 'https://www.google.com/',

    customer_email: req.user.email,

    client_reference_id: booking._id.toString(),

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,

          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
          },
        },
      },
    ],

    mode: 'payment',
  });

  res.status(201).json({
    status: 'success',

    data: {
      booking,
      session: session.url,
    },
  });
});

// Get All Bookings
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }

  if (req.params.userId) {
    filter = { user: req.params.userId };
  }

  const bookings = await Booking.find(filter);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

// Get One Booking
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No Booking found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

//Update Booking
exports.updateBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No Booking found with that ID', 404));
  }

  if (req.body.status === 'cancelled' && booking.status !== 'cancelled') {
    await updateParticipants(booking.tour, booking.date, false);
  }

  Object.assign(booking, req.body);

  await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

// Delete Booking / Cancel Booking
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No Booking found with that ID', 404));
  }

  // Decrease participants for this tour date
  await updateParticipants(booking.tour, booking.date, false);

  await booking.deleteOne();

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

// Get My Bookings
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({
    user: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});
