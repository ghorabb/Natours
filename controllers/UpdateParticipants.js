const Tour = require('../models/TourModel');
const AppError = require('../utils/appError');

exports.updateParticipants = async (tourId, dateId, createBooking) => {
  const modifier = createBooking ? 1 : -1;

  const tour = await Tour.findById(tourId);

  if (!tour) {
    throw new AppError('No tour found with that ID', 404);
  }

  const selectedDate = tour.startDates.id(dateId);

  if (!selectedDate) {
    throw new AppError('No tour date found with that ID', 404);
  }

  // When creating a booking
  if (createBooking) {
    if (selectedDate.soldout) {
      throw new AppError('This tour date is sold out', 400);
    }

    if (selectedDate.participants >= tour.maxGroupSize) {
      throw new AppError('This tour date is fully booked', 400);
    }
  }

  selectedDate.participants += modifier;

  // Never allow negative participants
  if (selectedDate.participants < 0) {
    selectedDate.participants = 0;
  }

  // Automatically update soldout
  selectedDate.soldout = selectedDate.participants >= tour.maxGroupSize;

  await tour.save();
};
