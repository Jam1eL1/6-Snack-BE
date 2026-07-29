/**
 * Gets the current year and month.
 * @returns {object} Current year and month.
 */
export const getCurrentYearAndMonth = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  
  return { currentYear, currentMonth };
};

/**
 * Checks whether a date has expired.
 * @param expiresAt Expiration date.
 * @returns {boolean} Whether the date has expired.
 */
export const isExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
