class TimerWidget {
    constructor(dashboardApi) {
        this.dashboardApi = dashboardApi;
        this.youTrack = null;
        this.intervalId = null;
        this.timerFieldId = "";
        this.timer = null;
        this.userId = "";
        this.workItems = [];
    }

    async initWidget() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        const user = await this.dashboardApi.fetchHub('api/rest/users/me?fields=login');    
        const { services } = await this.dashboardApi.fetchHub('api/rest/services?query=applicationName:YouTrack');
        this.youTrack = services[0];
        this.userId = user.login;
        
        const query = encodeURIComponent(`#${user.login} has: {Active Timers}  Active Timers: -{?}`);
        const activeTimers = encodeURIComponent(`Active Timers`);

        const timerIssues = await this.dashboardApi.fetch(this.youTrack.id,`api/issues?query=${query}&fields=idReadable,summary,project(id),customFields(id,name,value(name))&customFields=${activeTimers}&customFields=Timer&$top=1`);
        // console.log(timerIssues)
        
        if (!timerIssues.length) {
            return this.renderTimerDetails();
        }
        const timerField = timerIssues[0].customFields.find(({name}) => name === "Timer");
        this.timerFieldId = timerField.id
        const activeTimersField = timerIssues[0].customFields.find(({name}) => name === "Active Timers");

        const projectId = timerIssues[0].project.id;
        this.workItems = await this.dashboardApi.fetch(this.youTrack.id,`api/admin/projects/${projectId}/timeTrackingSettings/workItemTypes?fields=id,name`);

        this.timer = timerIssues.length ? {
            fieldId: activeTimersField.id,
            issueUrl: `${this.youTrack.homeUrl}/issue/${timerIssues[0].idReadable}`,
            issueId: timerIssues[0].idReadable,
            issueSummary: timerIssues[0].summary,
            ...this.parseUserTimer(activeTimersField.value),
        } : null

        this.dashboardApi.setTitle(`User Timer (${user.login})`)

        this.intervalId = setInterval(() => {
            this.renderTimerDetails();
        }, 1000);
    }

    parseUserTimer (timers) {
        if (!timers) { return {}; }
        const userTimers = timers.split(" ");
        const [, workItemIndex, startTime, endTime] = userTimers.map((timer) => timer.split(":")).find(([login]) => login === this.userId);
        const workItem = this.workItems[+workItemIndex];
        return { activity: workItem ? workItem.name : "", startTime, endTime };
    }

    renderTimerDetails() {
        const container = document.getElementById('timer-details');
        if (this.timer) {
            const duration = this.timer.endTime ? +this.timer.endTime-this.timer.startTime : Date.now()-this.timer.startTime
            const spendTime = new Date(duration).toISOString().substring(11,19);
    
            container.innerHTML = `
            <div class="timer-widget">
                <div class="timer-widget-issue">
                    <div class="timer-widget-issue-info">
                        <a target="_blank" href="${this.timer.issueUrl}" class="timer-widget-link timer-widget-issue-id" data-test="ring-link">
                            <span class="inner_cbe __singleValue__">${this.timer.issueId}</span>
                        </a>
                        <a target="_blank" href="${this.timer.issueUrl}" class="timer-widget-link timer-widget-issue-summary" data-test="ring-link">
                            <span class="inner_cbe __singleValue__">${this.timer.issueSummary}</span>
                        </a>
                    </div>
                </div>

                <div>Activity: ${this.timer.activity}</div>
                <div>Spent time: ${spendTime}</div>
                <button id="stop-timer">stop</button>
                <button id="update-timer">${this.timer.endTime ? "resume" : "pause"}</button>
            </div>
            `;
    
            const stopTimer = document.getElementById('stop-timer');
            if (stopTimer.addEventListener) {
                stopTimer.addEventListener('click', () => this.stopTimer(), false);
            }
            const updateTimer = document.getElementById('update-timer');
            if (updateTimer.addEventListener) {
                updateTimer.addEventListener('click', () => this.updateTimer(), false);
            }
        } else {
            container.innerHTML = `
            <div>No timer</div>
            `;
        }

    }

    removeTimer(timers) {
        if (!timers) { return ""; }
        const userTimers = timers.split(" ");
        const activeTimers = userTimers.map((timer) => timer.split(":"));
        const index = activeTimers.findIndex(([login]) => login === this.userId);
        if (index < 0) { return timers }

        activeTimers.splice(index,1)
        return activeTimers.map((timer) => timer.join(":")).join(" ");
    }

    async updateTimer() {
        const { issueId, fieldId } = this.timer
        const response = await this.dashboardApi.fetch(this.youTrack.id, `api/issues/${issueId}/customFields/${this.timerFieldId}?fields=value(name)&muteUpdateNotifications=true`, {
            method: 'POST',
            body: { value: { name: this.timer.activity } }
        })
        
        const activeTimers = await this.dashboardApi.fetch(this.youTrack.id, `api/issues/${issueId}/customFields/${fieldId}?fields=value`);
        console.log("activeTimers", activeTimers);

        this.timer = {
            ...this.timer,
            ...this.parseUserTimer(activeTimers.value)
        }
    }


    async stopTimer() {
        const { issueId, fieldId } = this.timer

        const activeTimers = await this.dashboardApi.fetch(this.youTrack.id, `api/issues/${issueId}/customFields/${fieldId}?fields=value`);
        const updatedTimers = this.removeTimer(activeTimers.value)

        await this.dashboardApi.fetch(this.youTrack.id, `api/issues/${issueId}/customFields/${fieldId}?fields=value(name)&muteUpdateNotifications=true`, {
            method: 'POST',
            body: { value: updatedTimers }
        })

        this.timer = null
    }
}

Dashboard.registerWidget(async (dashboardApi, registerWidgetApi) => {
    const timerWidget = new TimerWidget(dashboardApi);
    timerWidget.initWidget();

    // Add the refresh button.
    registerWidgetApi({
        onRefresh: () => timerWidget.initWidget()
    });
});
