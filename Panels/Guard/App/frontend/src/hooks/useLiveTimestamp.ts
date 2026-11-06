import { useEffect, useState } from 'react';

function formatLiveTimestamp(date: Date): string {
  const datePart = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

export function useLiveTimestamp() {
  const [timestamp, setTimestamp] = useState(() => formatLiveTimestamp(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(formatLiveTimestamp(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timestamp;
}
