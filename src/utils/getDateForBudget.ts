import { subMonths, subYears } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const getDateForBudget = () => {
  const date = new Date();
  const timeZone = "America/Vancouver";
  const previousMonthDate = subMonths(date, 1);

  const year = formatInTimeZone(date, timeZone, "yyyy");
  const month = formatInTimeZone(date, timeZone, "MM");
  const previousYear = formatInTimeZone(subYears(date, 1), timeZone, "yyyy");
  const previousMonth = formatInTimeZone(previousMonthDate, timeZone, "MM");
  const previousMonthYear = formatInTimeZone(previousMonthDate, timeZone, "yyyy");

  return {
    year,
    month,
    previousYear,
    previousMonth,
    previousMonthYear,
  };
};

export default getDateForBudget;
