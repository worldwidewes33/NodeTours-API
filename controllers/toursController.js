const Tour = require("./../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    // BASIC FILTERS
    const queryObj = { ...req.query };
    const excludedFields = ["sort", "page", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERS
    let queryStr = JSON.stringify(queryObj);

    // replace any instance of the words lt, lte, gt, gte with mongodb equivalent
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    const query = Tour.find(JSON.parse(queryStr));

    // SORT QUERY
    if (req.query.sort) {
      const sortParams = req.query.sort.replace(/,/g, " ");
      query.sort(sortParams);
    } else {
      query.sort("-createdAt");
    }

    // RESTRICT FIELDS
    if (req.query.fields) {
      const fields = req.query.fields.replace(/,/g, " ");

      query.select(fields);
    }
    query.select("-__v");

    // Limits and Pagination
    const limit = +req.query.limit || 100;
    const page = +req.query.page || 1;
    const skip = (page - 1) * limit;

    const docCount = await Tour.countDocuments();

    console.log(docCount);

    if (skip >= docCount) {
      throw new Error("Page Does Not Exists");
    }

    query.skip(skip).limit(limit);

    const tours = await query;

    // send response
    res.status(200).json({ status: "success", data: { tours } });
  } catch (err) {
    res
      .status(400)
      .json({ status: "fail", message: "Unable to query database" });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: "success", data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: "fail", data: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", data: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "fail", data: err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", data: err });
  }
};
