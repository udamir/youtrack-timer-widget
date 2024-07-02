const parseTimers = (timersString = "") => {
  if (timersString === "" || timersString === null) return [];
  const userTimers = timersString.split(" ");
  return userTimers.map((timer) => timer.split(":"));
};

exports.parseTimers = parseTimers;

const buildTimers = (timersArr) => {
  return timersArr.map((timer) => timer.join(":")).join(" ");
};

exports.buildTimers = buildTimers;

exports.updateTimers = (timersString, userId, workItemIndex = 0) => {
  let action = "started";
  const timers = parseTimers(timersString || "");
  const index = timers.findIndex(([login]) => login === userId);

  if (index < 0) {
    // add timer with workItemIndex
    timers.push([userId, workItemIndex, Date.now()]);
  } else {
    const [, _workItemIndex, startTime, endTime] = timers[index];

    if (workItemIndex == _workItemIndex) {
      if (endTime) {
        // resume timer
        action = "resumed";
        timers[index] = [userId, workItemIndex, Number(startTime) - Number(endTime) + Date.now()];
      } else {
        // pause timer
        action = "paused";
        timers[index] = [userId, workItemIndex, startTime, Date.now()];
      }
    } else {
      // update timer with new workItemIndex
      timers[index] = [userId, workItemIndex, Date.now()];
    }
  }
  
  return { action, timers: buildTimers(timers)};
};

exports.hasTimer = (user, timersString = "") => {
  const timers = parseTimers(timersString);
  return timers.findIndex(([login]) => login === user) >= 0;
};

exports.removeTimer = (user, timersString = "") => {
  const timers = parseTimers(timersString);
  const index = timers.findIndex(([login]) => login === user);
  if (index < 0) {
    return timersString;
  }
  timers.splice(index, 1);
  return buildTimers(timers);
};
