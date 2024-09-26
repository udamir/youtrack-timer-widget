import type { UserTimer } from "./types/Timer"
import type { WorkItemTypeEntity } from "./types"

export const parseUserTimer = (timers: string, userId: string, workItems: WorkItemTypeEntity[]): UserTimer | {} => {
  if (!timers) {
    return {}
  }
  const userTimers: string[] = timers.split(" ")
  const [, workItemIndex, startTime, endTime] = userTimers
    .map((timer) => timer.split(":"))
    .find(([login]) => login === userId)!
  const workItem = workItems[+workItemIndex]
  return { activity: workItem ? workItem.name : "", startTime, endTime }
}

export const removeUserTimer = (timers: string, userId: string): string => {
  if (!timers) {
    return ""
  }
  const userTimers = timers.split(" ")
  const activeTimers = userTimers.map((timer) => timer.split(":"))
  const index = activeTimers.findIndex(([login]) => login === userId)
  if (index < 0) {
    return timers
  }

  activeTimers.splice(index, 1)
  return activeTimers.map((timer) => timer.join(":")).join(" ")
}

export const calcSpentTime = (startTime: string, endTime: string): string => {
  const duration = endTime ? +endTime - Number(startTime) : Date.now() - Number(startTime)
  return new Date(duration).toISOString().substring(11, 19)
}
