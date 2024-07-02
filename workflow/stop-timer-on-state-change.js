const { Issue, Field } = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = Issue.onChange({
  title: 'Stop all timers on state change',
  guard: ({ issue }) => {
    return issue.fields.isChanged('State') && issue.fields["Active Timers"];
  },
  action: function({ issue }) {
	  issue.fields["Active Timers"] = null;
  },
  requirements: {
   	ActiveTimers: {
      type: Field.stringType,
      name: 'Active Timers'
    }
  }
});