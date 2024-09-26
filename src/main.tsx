import DashboardAddons from "hub-dashboard-addons"
import { YouTrack } from "youtrack-client"
import ReactDOM from "react-dom/client"
import React from "react"

import { WidgetContextProvider } from "./contexts/WidgetContext"
import { TimerWidget } from "./components/TimerWidget"
import { userFields } from "./consts"

import "./index.css"

DashboardAddons.registerWidget(async (dashboardApi, widgetApi) => {
  const youtrack = await YouTrack.widget(dashboardApi)
  const user = await youtrack.Users.getCurrentUserProfile({ fields: userFields })
  console.log(user)

  ReactDOM.createRoot(document.getElementById("timer-widget")!).render(
    <WidgetContextProvider dashboardApi={dashboardApi} widgetApi={widgetApi} youtrack={youtrack} user={user}>
      <TimerWidget />
    </WidgetContextProvider>,
  )
})
