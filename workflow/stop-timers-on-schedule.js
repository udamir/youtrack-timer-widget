var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onSchedule({
  title: 'Stop Active Timers at 13:00 and 18:00',
  search: 'has: {Active Timers} Active Timers: -{?}',
  cron: '0 0 13,18 * * ?',
  guard: function() {
    return true;
  },
  action: function({issue}) {
    issue.fields["Active Timers"] = null;
  },
  requirements: {
   	ActiveTimers: {
      type: entities.Field.stringType,
      name: 'Active Timers'
    }
  }
});