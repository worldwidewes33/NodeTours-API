const mongoose = require("mongoose");
const dotenv = require("dotenv");
// use config.env
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "PASSWORD",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "a tour must have a name"],
    unique: true,
  },
  rating: { type: Number, default: 4.5 },
  price: {
    type: Number,
    required: [true, "a tour must have a price"],
  },
});

const Tour = mongoose.model("Tour", tourSchema);

const test = new Tour({ price: 350, name: "The Forest Hike" });
test
  .save()
  .then((doc) => console.log(doc))
  .catch((err) => console.log("Error 💥", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
