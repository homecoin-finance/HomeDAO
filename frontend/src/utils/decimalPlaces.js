export const decimalPlaces = (value) => {
  if (Math.floor(value) !== value)
    return value.toString().split('.')[1].length || 0;
  return 0;
};
