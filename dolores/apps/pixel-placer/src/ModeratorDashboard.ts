import { QualitativeStudy, Question } from './QualitativeStudy';

export class ModeratorDashboard {
    private study: QualitativeStudy;
    private container: HTMLElement | null = null;
    private isOpen = false;

    constructor(study: QualitativeStudy) {
        this.study = study;
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.render();
    }

    close() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.isOpen = false;
    }

    private render() {
        this.container = document.createElement('div');
        Object.assign(this.container.style, {
            position: 'fixed', top: '10px', right: '10px', bottom: '10px', width: '400px',
            backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '8px',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.5)', zIndex: '20000',
            display: 'flex', flexDirection: 'column', color: '#eee', fontFamily: 'sans-serif'
        });

        // Header
        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '15px', background: '#2d2d2d', borderBottom: '1px solid #444',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        });
        header.innerHTML = '<strong>Moderator Dashboard</strong>';
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.onclick = () => this.close();
        header.appendChild(closeBtn);
        this.container.appendChild(header);

        // Content (List of Questions)
        const content = document.createElement('div');
        Object.assign(content.style, { flex: '1', overflowY: 'auto', padding: '15px' });
        this.renderQuestionList(content);
        this.container.appendChild(content);

        // Footer (Add Button)
        const footer = document.createElement('div');
        Object.assign(footer.style, { padding: '15px', borderTop: '1px solid #444' });
        const addBtn = document.createElement('button');
        addBtn.innerText = '+ Add Question';
        Object.assign(addBtn.style, {
            width: '100%', padding: '8px', cursor: 'pointer',
            backgroundColor: '#4dabf7', border: 'none', borderRadius: '4px', color: 'white'
        });
        addBtn.onclick = () => {
            const newQ: Question = {
                id: `manual_${Date.now()}`,
                text: 'New Question',
                type: 'open'
            };
            this.study.addQuestion(newQ);
            this.renderQuestionList(content);
        };
        footer.appendChild(addBtn);
        this.container.appendChild(footer);

        document.body.appendChild(this.container);
    }

    private renderQuestionList(container: HTMLElement) {
        container.innerHTML = '';
        const questions = this.study.getQuestions();

        questions.forEach((q, index) => {
            const item = document.createElement('div');
            Object.assign(item.style, {
                background: '#333', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #555'
            });

            const topRow = document.createElement('div');
            topRow.style.display = 'flex';
            topRow.style.justifyContent = 'space-between';
            topRow.style.marginBottom = '5px';

            const typeLabel = document.createElement('span');
            typeLabel.innerText = q.type.toUpperCase();
            typeLabel.style.fontSize = '0.7em';
            typeLabel.style.background = '#000';
            typeLabel.style.padding = '2px 5px';
            typeLabel.style.borderRadius = '3px';

            const followUpToggle = document.createElement('button');
            followUpToggle.innerText = q.followUpEnabled ? '🤖 Follow-up: ON' : '🤖 Follow-up: OFF';
            followUpToggle.style.fontSize = '0.7em';
            followUpToggle.style.marginRight = '5px';
            followUpToggle.style.background = q.followUpEnabled ? '#2f9e44' : '#555';
            followUpToggle.style.color = 'white';
            followUpToggle.style.border = 'none';
            followUpToggle.style.borderRadius = '3px';
            followUpToggle.style.cursor = 'pointer';
            followUpToggle.onclick = () => {
                this.study.updateQuestion(q.id, { followUpEnabled: !q.followUpEnabled });
                this.renderQuestionList(container);
            };

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.alignItems = 'center';

            const editBtn = document.createElement('button');
            editBtn.innerText = '✎';
            editBtn.style.marginRight = '5px';
            editBtn.style.cursor = 'pointer';
            editBtn.style.background = '#444';
            editBtn.style.color = 'white';
            editBtn.style.border = 'none';
            editBtn.style.borderRadius = '3px';
            editBtn.onclick = () => this.editQuestion(q, item);

            const delBtn = document.createElement('button');
            delBtn.innerText = '🗑';
            delBtn.style.cursor = 'pointer';
            delBtn.style.background = '#444';
            delBtn.style.color = '#ff6b6b';
            delBtn.style.border = 'none';
            delBtn.style.borderRadius = '3px';
            delBtn.onclick = () => {
                this.study.deleteQuestion(q.id);
                this.renderQuestionList(container);
            };

            actions.appendChild(followUpToggle);
            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            topRow.appendChild(typeLabel);
            topRow.appendChild(actions);

            const textDiv = document.createElement('div');
            textDiv.innerText = `${index + 1}. ${q.text}`;

            item.appendChild(topRow);
            item.appendChild(textDiv);
            container.appendChild(item);
        });
    }

    private editQuestion(q: Question, container: HTMLElement) {
        container.innerHTML = '';

        const input = document.createElement('input');
        input.value = q.text;
        Object.assign(input.style, { width: '100%', padding: '5px', marginBottom: '5px' });

        const typeSelect = document.createElement('select');
        ['open', 'binary', 'rating'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.text = t;
            if (t === q.type) opt.selected = true;
            typeSelect.appendChild(opt);
        });

        const followUpLabel = document.createElement('label');
        followUpLabel.style.display = 'block';
        followUpLabel.style.fontSize = '0.8em';
        followUpLabel.style.marginTop = '10px';
        const followUpCheck = document.createElement('input');
        followUpCheck.type = 'checkbox';
        followUpCheck.checked = !!q.followUpEnabled;
        followUpLabel.appendChild(followUpCheck);
        followUpLabel.appendChild(document.createTextNode(' Allow Gemini Follow-up'));

        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Save';
        Object.assign(saveBtn.style, {
            marginTop: '10px', padding: '5px 15px', background: '#4dabf7', border: 'none', borderRadius: '4px', cursor: 'pointer'
        });
        saveBtn.onclick = () => {
            this.study.updateQuestion(q.id, {
                text: input.value,
                type: typeSelect.value as any,
                followUpEnabled: followUpCheck.checked
            });
            // Re-render list
            const listContainer = container.parentElement;
            if (listContainer) this.renderQuestionList(listContainer);
        };

        container.appendChild(input);
        container.appendChild(typeSelect);
        container.appendChild(followUpLabel);
        container.appendChild(saveBtn);
    }
}
