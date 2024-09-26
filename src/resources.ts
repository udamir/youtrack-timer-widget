import type { YouTrack } from "youtrack-client"
import type { ActiveTimer } from "./types/Timer"
import { parseUserTimer } from "./utils"

export const getProjectWorkItems = async (youtrack: YouTrack, projectId: string) => {
  return youtrack.Admin.Projects.getProjectWorkItemTypes(projectId, { fields: ["id", "name"] })
}

export const findIssueWithTimer = async (youtrack: YouTrack, userId: string) => {
  const query = `'${userId}:' has: {Active Timers} Active Timers: -{?}`
  const activeTimers = "Active Timers"
  const timerIssues = await youtrack.Issues.getIssues({
    query,
    fields: ["idReadable", "summary", { project: ["id"], customFields: ["id", "name", "value"] }] as const,
    customFields: [activeTimers, "Timer"],
    $top: 1,
  })

  if (!timerIssues.length) {
    return null
  }

  return timerIssues[0]
}

export const getActiveTimer = async (
  youtrack: YouTrack,
  userId: string,
  oldTimer?: ActiveTimer,
): Promise<ActiveTimer | null> => {
  const issue = await findIssueWithTimer(youtrack, userId)

  if (!issue) {
    return null
  }

  const { project, customFields, idReadable: issueId, summary: issueSummary } = issue

  const timerField = customFields.find(({ name }) => name === "Timer")
  const activeTimersField = customFields.find(({ name }) => name === "Active Timers")
  const workItems =
    oldTimer && oldTimer.issueId === issueId ? oldTimer.workItems : await getProjectWorkItems(youtrack, project.id)

  if (!timerField || !activeTimersField || typeof activeTimersField.value !== "string") {
    return null
  }

  return {
    timerFieldId: timerField.id,
    activeTimersFieldId: activeTimersField.id,
    issueUrl: `${youtrack.baseUrl}/issue/${issueId}`,
    issueId,
    issueSummary: issueSummary ?? "",
    workItems,
    ...parseUserTimer(activeTimersField.value, userId, workItems),
  }
}

export const setIssueTimer = (youtrack: YouTrack, issueId: string, timerFieldId: string, activity = "") => {
  return youtrack.Issues.updateIssueCustomField(
    issueId,
    timerFieldId,
    { value: { name: activity } },
    { fields: ["value"] },
  )
}

export const getIssueTimers = (youtrack: YouTrack, issueId: string, fieldId: string) => {
  return youtrack.Issues.getIssueCustomFieldById(issueId, fieldId, { fields: ["value"] })
}

export const setIssueActiveTimers = (youtrack: YouTrack, issueId: string, fieldId: string, timers: string) => {
  youtrack.Issues.updateIssueCustomField(issueId, fieldId, { value: timers }, { fields: [{ value: ["name"] }] })
}
