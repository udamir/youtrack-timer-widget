const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const { parseTimers } = require('./active-timers-utils');

const findRemovedTimer = (oldTimers, newTimers) => {
  return oldTimers.filter(([u1, w1]) => !newTimers.find(([u2, w2]) => u1 === u2 && w1 === w2));
};

exports.rule = entities.Issue.onChange({
  title: 'Create WorkItem on Timer Stop',
  guard: ({ issue }) => {
    return issue.fields.isChanged('Active Timers');
  },
  action: ({ issue }) => {
    const oldTimers = parseTimers(issue.oldValue("Active Timers"));
    const newTimers = parseTimers(issue.fields['Active Timers']);
   
    // Find Timers which were stoped
    const removedTimers = findRemovedTimer(oldTimers, newTimers);

    if (!removedTimers.length) return;
    
    const projectWorkItems = entities.WorkItemType.findByProject(issue.project);
    
    removedTimers.forEach((removedTimer) => {
      const [user, workItemIndex, startTime, endTime = Date.now()] = removedTimer;

      const duration = Math.floor((Number(endTime)-Number(startTime))/60000);
      const workItem = projectWorkItems.get(+workItemIndex);

      if (duration) {
        const newWorkItem = {
          description: workflow.i18n('The work item automatically added by the timer.'),
          date: Date.now(),
          author: entities.User.findByLogin(user),
          type: workItem || null,
          duration: duration
        };

        issue.addWorkItem(newWorkItem);

        if (workItem) {
	      workflow.message(`Work time "${workItem.name}" added with duration: ${duration}m`); 
        } else {
          workflow.message(`Work time added with duration: ${duration}m`);      
        }
      }
    });  
    
  },
  requirements: {
   	ActiveTimers: {
      type: entities.Field.stringType,
      name: 'Active Timers'
    }
  }
});