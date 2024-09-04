import { React, Fragment, useState } from 'react';
import NumberFormat from 'react-number-format';
import BigNumber from 'bignumber.js';

import './homeValueEditor.css';

export const HomeValueEditor = ({
  className,
  onHomeValueChange,
  inputRef,
  maxValue,
  valueTooHighContent,
  buttonLabel,
  onButtonClick,
  decimals,
  isDisabled,
  disabledWarningContent,
}) => {
  const [currentValue, setCurrentValue] = useState(new BigNumber('0'));
  const handleFocus = (event) => event.target.select();

  const showValueWarning = maxValue && currentValue.gt(maxValue);
  const showDisabledWarning =
    isDisabled === true &&
    !!disabledWarningContent &&
    !showValueWarning &&
    currentValue != 0;
  const disabled =
    isDisabled === true ||
    currentValue.lte(new BigNumber(0)) ||
    showValueWarning;

  return (
    <div className={'amountContainer' + (className ? ' ' + className : '')}>
      <NumberFormat
        getInputRef={inputRef}
        className="amountInput"
        displayType="input"
        decimalScale={decimals ? decimals : 6}
        allowNegative={false}
        onValueChange={({ value }) => {
          let newValue;
          if (!value || value === '.') {
            newValue = new BigNumber(0.0);
          } else {
            newValue = new BigNumber(value);
          }
          setCurrentValue(newValue);
          onHomeValueChange && onHomeValueChange(newValue);
        }}
        onFocus={handleFocus}
      />
      <div className={`valueTooHighMessage ${showValueWarning && 'visible'}`}>
        {showValueWarning ? valueTooHighContent : null}
      </div>
      <div
        className={`valueTooHighMessage ${showDisabledWarning && 'visible'}`}
      >
        {showDisabledWarning ? disabledWarningContent : null}
      </div>
      <button
        className="button"
        onClick={() => {
          onButtonClick && onButtonClick(currentValue);
        }}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
    </div>
  );
};
