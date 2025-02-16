import { CalculationMethod, Coordinates, Prayer, PrayerTimes } from 'adhan';
import { format } from 'date-fns';

export function calculatePrayerTimes(coordinates: Coordinates, date: Date = new Date()) {
  const params = CalculationMethod.MoonsightingCommittee();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Sunrise', time: prayerTimes.sunrise },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
  ];

  const formattedPrayers = prayers.map((prayer) => ({
    name: prayer.name,
    time: format(prayer.time, 'hh:mm a'),
    timestamp: prayer.time.getTime(),
  }));

  const now = Date.now();
  const nextPrayer = formattedPrayers.find((prayer) => prayer.timestamp > now);

  return {
    prayers: formattedPrayers,
    nextPrayer,
    remainingTime: nextPrayer
      ? Math.floor((nextPrayer.timestamp - now) / 1000 / 60)
      : null,
  };
}

export function formatRemainingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${
      remainingMinutes > 1 ? 's' : ''
    }`;
  }

  return `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
}
