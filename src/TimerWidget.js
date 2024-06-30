
import Button from '@jetbrains/ring-ui-built/components/button/button';
import ButtonSet from '@jetbrains/ring-ui-built/components/button-set/button-set';
import { useEffect, useState } from 'react';

import { getActiveTimer, getIssueTimers, setIssueActiveTimers, setIssueTimer } from './resources';
import { parseUserTimer, removeUserTimer } from './utils';
import { IssueTimer } from './IssueTimer';

import './TimerWidget.css';
import { ControlsHeight, ControlsHeightContext } from '@jetbrains/ring-ui-built/components/global/controls-height';

const TimerWidget = ({ registerWidgetApi, userId, fetchApi, app }) => {
  const [timer, setTimer] = useState(null);

  const loadWidgetData = async () => {
    setTimer(await getActiveTimer(fetchApi, userId, app.homeUrl));
  }

  useEffect(() => {
    loadWidgetData();
    registerWidgetApi({
      onRefresh: () => loadWidgetData()
    });
  });

  const updateTimer = async () => {
    await setIssueTimer(fetchApi, timer.issueId, timer.timerFieldId, timer.activity);

    const activeTimers = await getIssueTimers(fetchApi, timer.issueId, timer.activeTimersFieldId);
    setTimer({ ...timer, ...parseUserTimer(activeTimers.value, timer.userId, timer.workItems) });
  }

  const stopTimer = async () => {
    const activeTimers = await getIssueTimers(fetchApi, timer.issueId, timer.activeTimersFieldId);
    const updatedTimers = removeUserTimer(activeTimers.value, userId);

    await setIssueActiveTimers(fetchApi, timer.issueId, timer.activeTimersFieldId, updatedTimers);
    setTimer(null);
  }

  return timer ? (
    <ControlsHeightContext.Provider value={ControlsHeight.S}>
      <div className="timer-widget">
        <IssueTimer {...timer} />
        <ButtonSet>
          <Button className='timer-widget-stop' primary onClick={() => stopTimer()}>Stop</Button>
          <Button className='timer-widget-update' onClick={() => updateTimer()}>{ timer.endTime ? "Resume" : "Pause" }</Button>
        </ButtonSet>
      </div>
    </ControlsHeightContext.Provider>
  ) : (
    <div>No Timer</div>
  )
}

export default TimerWidget;
