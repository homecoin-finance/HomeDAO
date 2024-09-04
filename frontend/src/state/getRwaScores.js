export const getRwaScores = ({ address, network }) => {
  const hiroUrl =
    network === 'main'
      ? 'homecoin-api.goloansnap.com'
      : 'homecoin-api.stage.goloansnap.com';
  const scores = fetch(
    `https://${hiroUrl}/bacon_scores?address=${address}&network=${network}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return scores;
};
