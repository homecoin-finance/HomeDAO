export const abbreviateNumber = (value) => {
  let newValue = value;
  let valueK = 9999;
  let valueM = 999500;
  let valueB = 999500000;

  if (value >= valueK) {
    const suffixes = ['', 'k', 'm', 'b', 't'];
    let suffixNum = 0;

    if (newValue === valueM) {
      newValue /= 1000;
      suffixNum = 2;
    } else if (newValue === valueB) {
      newValue /= 1000;
      suffixNum = 3;
    } else {
      while (newValue >= 1000) {
        newValue /= 1000;
        suffixNum++;
      }
    }

    newValue = newValue.toPrecision(3);

    if (newValue % 1 === 0) {
      newValue = parseInt(newValue).toFixed(0);
    } else {
      newValue = parseFloat(
        (suffixNum !== 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(2)
      );
    }

    newValue += suffixes[suffixNum];
  }

  return newValue;
};
