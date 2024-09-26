import Theme, { ThemeProvider } from "@jetbrains/ring-ui-built/components/global/theme"
import ButtonSet from "@jetbrains/ring-ui-built/components/button-set/button-set"
import Button from "@jetbrains/ring-ui-built/components/button/button"
import React, { useEffect, useRef, useState } from "react"

import "@jetbrains/ring-ui-built/components/style.css"
import "./styles.css"

import { getActiveTimer, getIssueTimers, setIssueActiveTimers, setIssueTimer } from "../resources"
import { parseUserTimer, removeUserTimer } from "../utils"
import { IssueTimer } from "./IssueTimer"

import "./TimerWidget.css"
import { ControlsHeight, ControlsHeightContext } from "@jetbrains/ring-ui-built/components/global/controls-height"
import { useWidgetContext } from "../contexts/WidgetContext"
import type { ActiveTimer } from "../types"

const darkMatcher = window.matchMedia("(prefers-color-scheme: dark)")

export const TimerWidget = () => {
  const [dark, setDark] = useState(darkMatcher.matches)
  const [timer, setTimer] = useState<ActiveTimer | null>(null)
  const currentTimer = useRef<number>()
  const { youtrack, user, widgetApi } = useWidgetContext()

  const loadWidgetData = async () => {
    const _timer = await getActiveTimer(youtrack, user.login)
    setTimer(_timer)
    if (_timer) {
      watchIssueTimer(_timer, 5000)
    }
  }

  // watch changes of timer
  const watchIssueTimer = async (watchTimer: ActiveTimer, interval: number) => {
    clearInterval(currentTimer.current)
    currentTimer.current =
      watchTimer &&
      setInterval(async () => {
        const _timer = await getActiveTimer(youtrack, user.login, watchTimer)
        setTimer(_timer)
      }, interval)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    loadWidgetData()
    widgetApi({
      onRefresh: () => loadWidgetData(),
    })
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    darkMatcher.addEventListener("change", onChange)

    return () => darkMatcher.removeEventListener("change", onChange)
  }, [])

  const updateTimer = async () => {
    if (!timer) {
      return
    }
    await setIssueTimer(youtrack, timer.issueId, timer.timerFieldId, timer.activity)

    const activeTimers = await getIssueTimers(youtrack, timer.issueId, timer.activeTimersFieldId)
    setTimer({ ...timer, ...parseUserTimer(activeTimers.value as string, user.login, timer.workItems) })
  }

  const stopTimer = async () => {
    if (!timer) {
      return
    }
    const activeTimers = await getIssueTimers(youtrack, timer.issueId, timer.activeTimersFieldId)
    const updatedTimers = removeUserTimer(activeTimers.value as string, user.login)

    await setIssueActiveTimers(youtrack, timer.issueId, timer.activeTimersFieldId, updatedTimers)
    setTimer(null)
  }

  return (
    <ThemeProvider className="App" theme={dark ? Theme.DARK : Theme.LIGHT}>
      <ControlsHeightContext.Provider value={ControlsHeight.S}>
        {timer ? (
          <div className="timer-widget">
            <IssueTimer {...timer} />
            <ButtonSet>
              <Button className="timer-widget-stop" primary onClick={() => stopTimer()}>
                Stop
              </Button>
              <Button className="timer-widget-update" onClick={() => updateTimer()}>
                {timer.endTime ? "Resume" : "Pause"}
              </Button>
            </ButtonSet>
          </div>
        ) : (
          <div className="timer-widget">No Timer</div>
        )}
      </ControlsHeightContext.Provider>
    </ThemeProvider>
  )
}
