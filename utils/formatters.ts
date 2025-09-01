export const formatCurrency = (amount: number, currency: string, options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>) => {
  // Use 'en-US' as a stable base for number formatting (e.g., dots vs commas).
  // A more advanced implementation could store and use the user's preferred locale.
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};
