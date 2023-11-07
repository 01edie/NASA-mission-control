const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

const getPagination = (query) => {
  const limit = Math.abs(query.limit) || DEFAULT_LIMIT;
  const page = Math.abs(query.page) || DEFAULT_PAGE;
  const skip = (page - 1) * limit;
  return {
    skip,
    limit,
  };
};

module.exports = {
  getPagination,
};
