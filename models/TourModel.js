const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters'],
      minlength: [6, 'A tour name must have more or equal 6 characters'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a groupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Tour must have a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    //   select: false,
    // },
    // startDates: {
    //   type: [Date],
    // },
    startDates: [
      {
        date: {
          type: Date,
          required: [true, 'A tour date must have a date'],
        },

        participants: {
          type: Number,
          default: 0,
          min: [0, 'Participants cannot be negative'],
        },

        soldout: {
          type: Boolean,
          default: false,
        },
      },
    ],
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ startLocation: '2dsphere' }, { sparse: true });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', { ref: 'Review', foreignField: 'tour', localField: '_id' });

tourSchema.pre(/^find/, function () {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
