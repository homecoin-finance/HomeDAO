import React from 'react';
import { Spinner } from '../../components';
import './statusSection.css';
import NumberFormat from 'react-number-format';
import { useLocation, useNavigate } from 'react-router-dom';

const StatusLine = ({ label, value, info }) => {
  return (
    <div className="statusSectionLine">
      <div className="statusSectionMain">
        <div>{label}</div>
        <div className="value">
          {value !== undefined ? (
            <NumberFormat
              displayType="text"
              value={value.toString()}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale
            />
          ) : (
            '...'
          )}
        </div>
      </div>
      {info && <div className="statusSectionInfo">{info}</div>}
    </div>
  );
};

export const StatusSection = ({
  tokenPrice,
  unstakedHome,
  boostedHome,
  loading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="statusSection">
      <StatusLine
        label="Unboosted HOME"
        value={loading ? <Spinner /> : unstakedHome}
      />
      <StatusLine
        label="Boosted HOME"
        value={loading ? <Spinner /> : boostedHome}
      />
    </div>
  );
};
