export const convertDecimalRGBToHex = (rgb: string) => {
  return "#" + Number(rgb).toString(16);
};
export const convertHexRGBToDecimal = (rgb: string) => {
  const value = rgb.substr(1);
  return parseInt(value, 16);
};
