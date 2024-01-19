const path = require("path");

/**
 * @module path
 * Provides the path to the director of the node entry point
 */
module.exports = path.dirname(require.main.filename);
