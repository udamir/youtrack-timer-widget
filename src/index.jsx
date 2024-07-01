import '@jetbrains/ring-ui-built/components/style.css';
import DashboardAddons from 'hub-dashboard-addons/dist/dashboard-api';
import ReactDOM from 'react-dom/client';
import React from 'react';

import { createFetchApi, getService, getUser } from './resources';
import TimerWidget from './TimerWidget';

DashboardAddons.registerWidget(async (dashboardApi, registerWidgetApi) => {
  const app = await getService(dashboardApi, "Youtrack");
  const user = await getUser(dashboardApi);
  const fetchApi = createFetchApi(dashboardApi, app.id);

  const root = ReactDOM.createRoot(document.getElementById('timer-widget'));
  root.render(<TimerWidget {...{registerWidgetApi, app, userId: user.login, fetchApi}} />);
});
