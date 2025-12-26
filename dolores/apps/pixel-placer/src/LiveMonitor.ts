export class LiveMonitor {
    private container: HTMLElement | null = null;
    private logs: string[] = [];
    private listContainer: HTMLElement | null = null;
    private context: any;
    private stats = { pixels: 0, surveys: 0, rage: 0, users: 1 };

    constructor(context: any) {
        this.context = context;
        this.render();
        this.listen();
    }

    log(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.unshift(`[${timestamp}] ${message}`);
        this.renderLogs();
    }

    private render() {
        this.container = document.createElement('div');
        Object.assign(this.container.style, {
            position: 'absolute', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: '#050505', color: '#00ff00', fontFamily: 'monospace',
            padding: '20px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            zIndex: '100000'
        });

        const header = document.createElement('h2');
        header.innerText = '📊 Live Study Monitor';
        header.style.borderBottom = '1px solid #333';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '20px';
        this.container.appendChild(header);

        // Stats Row
        const statsRow = document.createElement('div');
        statsRow.style.display = 'flex';
        statsRow.style.gap = '20px';
        statsRow.style.marginBottom = '20px';

        const createStat = (label: string, value: string) => {
            const div = document.createElement('div');
            div.style.background = '#111';
            div.style.padding = '15px';
            div.style.minWidth = '150px';
            div.style.border = '1px solid #333';

            const l = document.createElement('div');
            l.innerText = label;
            l.style.color = '#888';

            const v = document.createElement('div');
            v.innerText = value;
            v.style.fontSize = '2em';
            v.id = `stat-${label.replace(' ', '-')}`;

            div.appendChild(l);
            div.appendChild(v);
            return div;
        };

        statsRow.appendChild(createStat('Active Users', '1'));
        statsRow.appendChild(createStat('Pixels Placed', '0'));
        statsRow.appendChild(createStat('Survey Answers', '0'));
        statsRow.appendChild(createStat('Rage Clicks', '0'));
        this.container.appendChild(statsRow);

        // Logs
        const logsHeader = document.createElement('div');
        logsHeader.innerText = '> Event Stream';
        logsHeader.style.color = '#fff';
        logsHeader.style.marginBottom = '10px';
        this.container.appendChild(logsHeader);

        this.listContainer = document.createElement('div');
        Object.assign(this.listContainer.style, {
            flex: '1', overflowY: 'auto', background: '#0a0a0a', border: '1px solid #333',
            padding: '10px', fontSize: '1.1em'
        });
        this.container.appendChild(this.listContainer);

        document.body.appendChild(this.container);

        // Initial log
        this.log('Session started. Listening for events...');
    }

    private listen() {
        if (!this.context?.realtime) return;

        this.context.realtime.connect().subscribe('moderator_event', (event: any) => {
            switch (event.type) {
                case 'session_start':
                    this.log(`NEW USER connected as ${event.userRole}`);
                    this.updateStat('Active Users', ++this.stats.users);
                    break;
                case 'pixel_placed':
                    this.log(`Pixel placed at (${event.x}, ${event.y})`);
                    this.updateStat('Pixels Placed', ++this.stats.pixels);
                    break;
                case 'survey_answer':
                    this.log(`Survey result: "${event.question.substring(0, 30)}..." → "${event.answer}"`);
                    this.updateStat('Survey Answers', ++this.stats.surveys);
                    break;
                case 'rage_click':
                    this.log('🚨 FRUSTRATION DETECTED: Rage click event received');
                    this.updateStat('Rage Clicks', ++this.stats.rage);
                    break;
            }
        });
    }

    private updateStat(label: string, value: number) {
        const id = `stat-${label.replace(' ', '-')}`;
        const el = document.getElementById(id);
        if (el) el.innerText = value.toString();

        // Highlight change
        if (el) {
            el.style.color = '#fff';
            setTimeout(() => el.style.color = '#00ff00', 500);
        }
    }

    private renderLogs() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';
        this.logs.forEach(log => {
            const line = document.createElement('div');
            line.innerText = log;
            line.style.padding = '5px 0';
            line.style.borderBottom = '1px solid #111';
            this.listContainer!.appendChild(line);
        });
    }
}
