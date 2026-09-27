const dotenv = require('dotenv');

// Load config.env in local environment only
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './config.env' });
}
const app = require('./app');
const connectDB = require('./db');

const port = 3000;

if (!process.env.VERCEL) {
  connectDB().then(() => {
    const server = app.listen(3000, () => {
      console.log(`App running on port ${port}...`);
    });

    process.on('unhandledRejection', (err) => {
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  });
}
