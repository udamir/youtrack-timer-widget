import type { WorkItemTypeEntity } from "./entities"

export type UserTimer = {
  activity: string
  startTime: string
  endTime: string
}

export type ActiveTimer = Partial<UserTimer> & {
  timerFieldId: string
  activeTimersFieldId: string
  issueUrl: string
  issueId: string
  issueSummary: string
  workItems: WorkItemTypeEntity[]
}
