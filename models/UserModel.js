const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User miust have a name.'],
    trim: true,
    maxlength: [40, 'Name name must have less or equal 40 characters'],
    minlength: [3, 'Name must have more or equal 3 characters'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please enter your email.'],
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  photo: { type: String, default: 'default.jpg' },

  password: {
    type: String,
    required: [true, 'Please enter your password.'],
    minlength: [8, 'password must have more or equal 8 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please enter your Password.'],
    //This works only on save and create
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Please enter a match password',
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
    select: false,
  },
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  passwordResetCode: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

userSchema.methods.correctPassword = async function (enteredPasssword, userPassword) {
  return await bcrypt.compare(enteredPasssword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const jwtIssuedAt = new Date(JWTTimestamp * 1000);

    return this.passwordChangedAt > jwtIssuedAt;
  }

  return false;
};

userSchema.methods.createEmailActivation = function () {
  const code = crypto.randomInt(100000, 1000000).toString();
  this.emailVerificationCode = crypto.createHash('sha256').update(code).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

userSchema.methods.createPasswordResetCode = function () {
  const code = crypto.randomInt(100000, 1000000).toString();
  this.passwordResetCode = crypto.createHash('sha256').update(code).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
