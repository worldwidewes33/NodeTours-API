const fs = require("fs");
const path = require("path");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

const rootDir = require("./../../util/path");
const Tour = require("./../../models/tourModel");

// use config.env
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "PASSWORD",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

const tours = JSON.parse(
  fs.readFileSync(path.join(rootDir, "tours-simple.json"))
);

const uploadTours = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log("Error 💥", err);
  }
  process.exit();
};

const deleteTours = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data successfully deleted");
  } catch (err) {
    console.log("Error 💥", err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  uploadTours();
} else if (process.argv[2] === "--delete") {
  deleteTours();
}
