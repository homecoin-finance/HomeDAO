export const getEggs = (network) => {
  const hiroUrl =
    network === 'main'
      ? 'https://homecoin-api.goloansnap.com/eggs'
      : 'https://homecoin-api.stage.goloansnap.com/eggs';
  console.log(hiroUrl);
  const eggs = fetch(hiroUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });

  return eggs;
};
