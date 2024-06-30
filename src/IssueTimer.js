import Link from '@jetbrains/ring-ui-built/components/link/link';
import Text from '@jetbrains/ring-ui-built/components/text/text';

import { Timer } from './Timer';

export const IssueTimer = ({ issueId, issueSummary, issueUrl, activity, startTime, endTime }) => {
  return (
    <div className="timer-widget-issue">
      <div className="timer-widget-issue-info">
        <Link className="timer-widget-issue-id" href={issueUrl}>{issueId}</Link>
        <Link className="timer-widget-issue-summary" href={issueUrl}>{issueSummary}</Link>
      </div>
      <div className='timer-widget-activity'>
        <Text info>{activity}</Text>
      </div>
      <div>
        <Text info>Spent time: </Text><Timer startTime={startTime} endTime={endTime} />
      </div>
    </div>
  )
}