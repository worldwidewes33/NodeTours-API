const Tour = require("./../models/tourModel");

class QueryAPI {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    // BASIC FILTERS
    const queryObj = { ...this.queryObj };
    const excludedFields = ["sort", "page", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERS
    let queryStr = JSON.stringify(queryObj);

    // replace any instance of the words lt, lte, gt, gte with mongodb equivalent
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // SORT QUERY
    if (this.queryObj.sort) {
      const sortParams = this.queryObj.sort.replace(/,/g, " ");
      this.query = this.query.sort(sortParams);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // LIMIT FIELDS
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.replace(/,/g, " ");

      this.query = this.query.select(fields);
    }
    this.query = this.query.select("-__v");

    return this;
  }

  paginate() {
    // PAGINATION
    const limit = +this.queryObj.limit || 100;
    const page = +this.queryObj.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllTours = async (req, res) => {
  try {
    const queryAPI = new QueryAPI(Tour.find(), req.query);

    queryAPI.filter().sort().limitFields().paginate();

    const tours = await queryAPI.query;

    // send response
    res.status(200).json({ status: "success", data: { tours } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
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
