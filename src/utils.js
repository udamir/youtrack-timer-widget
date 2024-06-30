export const parseUserTimer = (timers, userId, workItems) => {
  if (!timers) { return {}; }
  const userTimers = timers.split(" ");
  const [, workItemIndex, startTime, endTime] = userTimers.map((timer) => timer.split(":")).find(([login]) => login === userId);
  const workItem = workItems[+workItemIndex];
  return { activity: workItem ? workItem.name : "", startTime, endTime };
}

export const removeUserTimer = (timers, userId) => {
  if (!timers) { return ""; }
  const userTimers = timers.split(" ");
  const activeTimers = userTimers.map((timer) => timer.split(":"));
  const index = activeTimers.findIndex(([login]) => login === userId);
  if (index < 0) { return timers }

  activeTimers.splice(index,1)
  return activeTimers.map((timer) => timer.join(":")).join(" ");
}

export const calcSpentTime = (startTime, endTime) => {
  const duration = endTime ? +endTime-startTime : Date.now()-startTime
  return new Date(duration).toISOString().substring(11,19);
}
