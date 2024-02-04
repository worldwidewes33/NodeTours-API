const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const rootDir = require('../../util/path');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

// use config.env
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.log(err));

const tours = JSON.parse(fs.readFileSync(path.join(rootDir, 'tours.json')));
const reviews = JSON.parse(fs.readFileSync(path.join(rootDir, 'reviews.json')));
const users = JSON.parse(fs.readFileSync(path.join(rootDir, 'users.json')));

const uploadTours = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Tour.create(tours);
    await Review.create(reviews);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log('Error 💥', err);
  }
  process.exit();
};

const deleteTours = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log('Error 💥', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  uploadTours();
} else if (process.argv[2] === '--delete') {
  deleteTours();
}
