const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const { search } = require('@jetbrains/youtrack-scripting-api/search');
const { hasTimer, updateTimers, removeTimer } = require('./active-timers-utils');

const findIndex = (set, value) => {
  for (let i = 0; i < set.size; i++) {
    if (set.get(i).name === value) {
      return i;
    }
  }
  return -1;
};

exports.rule = entities.Issue.onChange({
  title: 'Update timer when the value for "Timer" is selected',
  guard: ({ issue }) => {
    return issue.fields.isChanged('Timer') && issue.fields.Timer;
  },
  action: ({ issue, currentUser }) => {
    const userId = currentUser.login;
    const activity = issue.fields.Timer.name;
    const activeTimers = issue.fields['Active Timers'] === null ? "" : issue.fields['Active Timers'];
    
    console.log("Update timer", activity, activeTimers);
    // Stop timer to current user
    if (activity === "Stop") {
      issue.fields['Active Timers'] = removeTimer(userId, activeTimers);
      issue.fields.Timer = null;   
      return;
    }
    
    const projectWorkItems = entities.WorkItemType.findByProject(issue.project);
    const workItemIndex = findIndex(projectWorkItems, activity);
    
    if (workItemIndex < 0) {
      workflow.message(`Cannot start Timer. Work Item "${activity}" is not found is projct. Please check project timesheet settings.`); 
      issue.fields.Timer = null;
      return;
    }
    
    // Assign ticket to current User if ticket has no assignee or ~~owner has no Timers~~
    if (!issue.fields.Assignee /*|| !hasTimer(issue.fields.Assignee.name, activeTimers)*/) {
      issue.fields.Assignee = currentUser;      
    }
    
    const { action, timers } = updateTimers(activeTimers, userId, workItemIndex);
    issue.fields.ActiveTimers = timers;
    
    // Stop all timer in other issues assigned to current User
    const query = `#${userId} has: {Active Timers} Active Timers: -{?}`;
    const issuesWithTimer = search(null, query, currentUser);

    issuesWithTimer.forEach((foundIssue) => {
      // ignor current issue
      if (foundIssue.id === issue.id) return;
      foundIssue.fields["Active Timers"] = removeTimer(userId, foundIssue.fields["Active Timers"]);
    });

	workflow.message(`The timer for "${activity}" is ${action}.`);      

    issue.fields.Timer = null;
  },
  requirements: {
    Timer: {
      type: entities.EnumField.fieldType,
      Stop: {},
      "Analysis and Design": {},
      "Development": {},
      "Code review": {},
      "Troubleshooting": {},
      "Testing": {},
    },
   	ActiveTimers: {
      type: entities.Field.stringType,
      name: 'Active Timers'
    }
  }
});