import { parseUserTimer } from "./utils";

export const createFetchApi = (api, appId) => {
  return (url, config) => api.fetch(appId, url, config);
}

export const getUser = (api) => {
  return api.fetchHub('api/rest/users/me?fields=login');   
}

export const getService = async (api) => {
  const { services } = await api.fetchHub('api/rest/services?query=applicationName:YouTrack');
  return services[0];
}

export const getProjectWorkItems = async (fetchApi, projectId) => {
  return fetchApi(`api/admin/projects/${projectId}/timeTrackingSettings/workItemTypes?fields=id,name`);
}

export const getActiveTimer = async (fetchApi, userId, baseUrl) => {
  const query = encodeURIComponent(`#${userId} has: {Active Timers} Active Timers: -{?}`);
  const activeTimers = encodeURIComponent(`Active Timers`);
  
  const timerIssues = await fetchApi(`api/issues?query=${query}&fields=idReadable,summary,project(id),customFields(id,name,value(name))&customFields=${activeTimers}&customFields=Timer&$top=1`);
  if (!timerIssues.length) {
      return null;
  }

  const { project, customFields, idReadable: issueId, summary: issueSummary } = timerIssues[0];

  const timerField = customFields.find(({name}) => name === "Timer");
  const activeTimersField = customFields.find(({name}) => name === "Active Timers");
  const workItems = await getProjectWorkItems(fetchApi, project.id);

  return {
      timerFieldId: timerField.id,
      activeTimersFieldId: activeTimersField.id,
      issueUrl: `${baseUrl}/issue/${issueId}`,
      issueId,
      issueSummary,
      workItems,
      ...parseUserTimer(activeTimersField.value, userId, workItems),
  }
}

export const setIssueTimer = (fetchApi, issueId, timerFieldId, activity) => {
  return fetchApi(`api/issues/${issueId}/customFields/${timerFieldId}?fields=value(name)&muteUpdateNotifications=true`, {
    method: 'POST',
    body: { value: { name: activity } }
  });
}

export const getIssueTimers = (fetchApi, issueId, fieldId) => {
  return fetchApi(`api/issues/${issueId}/customFields/${fieldId}?fields=value`);
}

export const setIssueActiveTimers = (fetchApi, issueId, fieldId, timers) => {
  return fetchApi(`api/issues/${issueId}/customFields/${fieldId}?fields=value(name)&muteUpdateNotifications=true`, {
    method: 'POST',
    body: { value: timers }
  });
}
