export const secondsToTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds - min * 60);
  if (sec < 10) return `${min}:0${sec}`;
  return `${min}:${sec}`;
};
