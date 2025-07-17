export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

export const formatPercentage = (value) => {
  const num = Number(value) || 0;
  return `${num.toFixed(2)}%`;
};
