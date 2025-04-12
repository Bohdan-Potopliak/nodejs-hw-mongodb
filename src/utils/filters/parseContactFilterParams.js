export const parseContactFilterParams = ({ type, isFavorite }) => {
  const filters = {};

  if (type) {
    filters.contactType = type;
  }

  if (isFavorite !== undefined) {
    filters.isFavorite = isFavorite === 'true';
  }

  return filters;
};
