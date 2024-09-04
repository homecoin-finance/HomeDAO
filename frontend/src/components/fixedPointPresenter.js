import React from 'react';

export const FixedPointPresenter = ({ value, base }) => {
  // TODO: we probably just want to replace this with a generalized number control like
  // react-number-format (which hiro uses)
  return <span>{value / Math.pow(10, base)}</span>;
};

export const HomePresenter = ({ value }) => {
  return <FixedPointPresenter value={value} base={6} />;
};
