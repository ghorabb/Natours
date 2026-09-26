const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour!'],
    },
    date: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Booking must have a tour date!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!'],
    },

    price: {
      type: Number,
      required: [true, 'Booking must have a price!'],
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card'],
      required: [true, 'Booking must have a payment method!'],
    },

    paid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre(/^find/, function () {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
