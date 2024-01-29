/**
 * Manipulates mongoose query objects by filtering, sorting, limiting fields, and providing pagination for query results
 * @module queryApi
 */
class QueryAPI {
  /**
   * @constructor
   * @param {Mongoose Query} query - a mongoose query
   * @param {object} queryObj - an express request query property
   */
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  /**
   * Filters results by specified fields
   * @returns {QueryAPI} - the QueryAPI instance
   */
  filter() {
    // BASIC FILTERS
    const queryObj = { ...this.queryObj };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERS
    let queryStr = JSON.stringify(queryObj);

    // replace any instance of the words lt, lte, gt, gte with mongodb equivalent
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sorts the results by the sort property
   * @returns {QueryAPI} - the QueryAPI instance
   */
  sort() {
    if (this.queryObj.sort) {
      const sortParams = this.queryObj.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortParams);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Limits the returned fields by the fields property
   * @returns {QueryAPI} - the QueryAPI instance
   */
  limitFields() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.replace(/,/g, ' ');

      this.query = this.query.select(fields);
    }
    this.query = this.query.select('-__v');

    return this;
  }

  /**
   * Provides pagination features by limiting and skipping the specified number of results
   * @returns {QueryAPI} - the QueryAPI instance
   */
  paginate() {
    const limit = +this.queryObj.limit || 100;
    const page = +this.queryObj.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = QueryAPI;
