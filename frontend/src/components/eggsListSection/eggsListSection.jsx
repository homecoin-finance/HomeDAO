import React from 'react';
import { Spinner } from '..';
import { abbreviateNumber } from '../../utils';
import './eggsListSection.css';

export const EggsListSection = ({ eggs, loading }) => {
  return (
    <div className="eggsListSection">
      {!loading ? (
        <>
          {eggs.map((egg) => {
            return (
              <div
                className="eggPreview"
                key={egg.prop_token_id}
                data-egg-id={egg.prop_token_id}
              >
                <a
                  href={
                    'https://opensea.io/assets/ethereum/0x0e5af5cc3df53fcab8a92f07d6189e4189ed6ceb/' +
                    egg.prop_token_id
                  }
                >
                  <img src={egg.photo_uri} alt={egg.home_address} />
                </a>
                <div className="eggPreviewDetails">
                  <div className="eggAddress">{egg.home_address}</div>
                  <div className="lienValue">
                    ${abbreviateNumber(parseFloat(egg.value))} Lien
                  </div>
                  <div className="eggValue">
                    ${abbreviateNumber(parseFloat(egg.home_value))} Value
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
};
