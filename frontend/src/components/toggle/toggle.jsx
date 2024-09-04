import React from 'react';

import './toggle.css';

export const Toggle = ({
  checked,
  disabled,
  onChange,
  qaTitle,
  toggleProps,
  ...otherProps
}) => {
  const onChangeLocal = (e) => {
    // return true if on, false if off
    onChange(e.target.checked);
  };

  const { className } = otherProps;

  return (
    <label className={'switch ' + className}>
      <input
        type="checkbox"
        data-qa={`${qaTitle || `Unnamed`}-toggle`}
        className="input"
        onChange={onChangeLocal}
        checked={!!checked}
      />
      <span className="slider" />
    </label>
  );
};
