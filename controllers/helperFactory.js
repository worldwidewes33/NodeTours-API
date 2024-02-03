const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');
const QueryAPI = require('../util/queryApi');

exports.getMany = (Model) =>
  catchAsync(async (req, res, next) => {
    const queryAPI = new QueryAPI(Model.find(), req.query);

    queryAPI.filter().sort().limitFields().paginate();

    const docs = await queryAPI.query;

    // send response
    res.status(200).json({ status: 'success', data: { data: docs } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new APIError('No document found with that ID', 404));
    }

    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { data: newDoc } });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new APIError('No document found with that ID', 404));
    }

    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new APIError('No document found with that ID', 404));
    }

    res.status(204).json({ status: 'success', data: null });
  });
