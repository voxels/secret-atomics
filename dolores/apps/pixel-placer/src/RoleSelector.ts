export type UserRole = 'participant' | 'designer' | 'moderator';

export class RoleSelector {
    static async selectRole(): Promise<UserRole> {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            Object.assign(container.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: '#111', color: 'white', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', zIndex: '100000',
                fontFamily: 'sans-serif'
            });

            const title = document.createElement('h1');
            title.innerText = 'Select Your Role';
            title.style.marginBottom = '40px';
            container.appendChild(title);

            const createBtn = (text: string, role: UserRole, desc: string, icon: string) => {
                const btn = document.createElement('div');
                Object.assign(btn.style, {
                    background: '#222', border: '1px solid #444', padding: '20px',
                    margin: '10px', width: '300px', cursor: 'pointer', borderRadius: '8px',
                    textAlign: 'left', transition: 'background 0.2s', display: 'flex', alignItems: 'center'
                });
                btn.onmouseover = () => btn.style.background = '#333';
                btn.onmouseout = () => btn.style.background = '#222';

                btn.onclick = () => {
                    container.remove();
                    resolve(role);
                };

                const iconDiv = document.createElement('div');
                iconDiv.innerText = icon;
                iconDiv.style.fontSize = '2.5em';
                iconDiv.style.marginRight = '20px';

                const textDiv = document.createElement('div');
                const titleDiv = document.createElement('div');
                titleDiv.innerText = text;
                titleDiv.style.fontSize = '1.2em';
                titleDiv.style.fontWeight = 'bold';

                const descDiv = document.createElement('div');
                descDiv.innerText = desc;
                descDiv.style.color = '#888';
                descDiv.style.fontSize = '0.9em';
                descDiv.style.marginTop = '5px';

                textDiv.appendChild(titleDiv);
                textDiv.appendChild(descDiv);

                btn.appendChild(iconDiv);
                btn.appendChild(textDiv);

                return btn;
            };

            container.appendChild(createBtn('Study Participant', 'participant', 'Play the game and take the survey. (Standard User)', '👤'));
            container.appendChild(createBtn('Study Designer', 'designer', 'Construct and edit the qualitative study questions.', '🛠️'));
            container.appendChild(createBtn('Moderator', 'moderator', 'Monitor live activity and study results.', '📊'));

            document.body.appendChild(container);

            // Hide Loading status if visible
            const status = document.getElementById('status-bar');
            if (status) status.style.zIndex = '0'; // Push behind
        });
    }
}
