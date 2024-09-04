export const formatRwaBalance = ({ rwaCoinAmount, rwaCoinAccrued }) => {
  if (!rwaCoinAmount || !rwaCoinAccrued) return 0;
  return rwaCoinAmount.plus(rwaCoinAccrued).toFixed(2);
};
