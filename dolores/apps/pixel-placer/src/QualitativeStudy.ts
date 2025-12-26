import { GeminiModerator } from './GeminiModerator';

export type QuestionType = 'rating' | 'binary' | 'open';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    followUpEnabled?: boolean;
}

export class QualitativeStudy {
    private questions: Question[] = [];
    private currentIndex = 0;
    private container: HTMLElement | null = null;
    private isOpen = false;
    private moderator = GeminiModerator.getInstance();
    private context: any; // Using any for now to avoid complexity of multiple package imports

    constructor(context: any) {
        this.context = context;
        this.seedQuestions();
    }

    private seedQuestions() {
        this.questions = [
            { id: 'q1', text: "How would you rate your experience placing pixels?", type: 'rating', followUpEnabled: false },
            { id: 'q2', text: "Did you find the 'Buy Premium' option intrusive?", type: 'binary', followUpEnabled: false },
            { id: 'q3', text: "What motivated you to choose the colors you used?", type: 'open', followUpEnabled: true },
            { id: 'q4', text: "How likely are you to recommend this to a friend?", type: 'rating', followUpEnabled: false },
            { id: 'q5', text: "If you could add one feature, what would it be?", type: 'open', followUpEnabled: true },
            { id: 'q6', text: "Do you prefer the current grid size?", type: 'binary', followUpEnabled: false },
            { id: 'q7', text: "Rate the responsiveness of the interface.", type: 'rating', followUpEnabled: false },
            { id: 'q8', text: "Any final thoughts?", type: 'open', followUpEnabled: true }
        ];
    }

    // CRUD for Moderator Dashboard
    getQuestions(): Question[] { return [...this.questions]; }

    addQuestion(question: Question) {
        this.questions.push(question);
    }

    updateQuestion(id: string, updated: Partial<Question>) {
        const idx = this.questions.findIndex(q => q.id === id);
        if (idx !== -1) {
            this.questions[idx] = { ...this.questions[idx], ...updated };
        }
    }

    deleteQuestion(id: string) {
        this.questions = this.questions.filter(q => q.id !== id);
    }

    // UI Logic
    start() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.currentIndex = 0;
        this.renderOverlay();
        this.showQuestion();
    }

    private renderOverlay() {
        this.container = document.createElement('div');
        this.container.id = 'qualitative-study-overlay';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: '10000', color: 'white'
        });
        document.body.appendChild(this.container);
    }

    private async showQuestion() {
        if (!this.container) return;
        this.container.innerHTML = ''; // Clear previous

        if (this.currentIndex >= this.questions.length) {
            this.showCompletion();
            return;
        }

        const q = this.questions[this.currentIndex];

        const card = document.createElement('div');
        Object.assign(card.style, {
            backgroundColor: '#222', padding: '30px', borderRadius: '12px',
            maxWidth: '500px', width: '90%', textAlign: 'center',
            border: '1px solid #444'
        });

        // Gemini Branding if it's a follow-up (we'll modify this later for dynamic follow-ups)
        const isFollowUp = q.id.startsWith('follow_up');

        const header = document.createElement('h3');
        header.innerText = isFollowUp ? 'Gemini Follow-up' : `Question ${this.currentIndex + 1}/${this.questions.length}`;
        if (isFollowUp) header.style.color = '#4dabf7';

        const text = document.createElement('p');
        text.innerText = q.text;
        text.style.fontSize = '1.2em';
        text.style.margin = '20px 0';

        card.appendChild(header);
        card.appendChild(text);

        const inputContainer = document.createElement('div');

        // Render inputs based on type
        if (q.type === 'rating') {
            const stars = document.createElement('div');
            stars.style.fontSize = '2em';
            stars.style.cursor = 'pointer';
            [1, 2, 3, 4, 5].forEach(rating => {
                const star = document.createElement('span');
                star.innerText = '★';
                star.style.color = '#444';
                star.style.margin = '0 5px';
                star.onclick = () => {
                    // Visual feedback then next
                    Array.from(stars.children).forEach((s: any, i) => {
                        s.style.color = i < rating ? 'gold' : '#444';
                    });
                    setTimeout(() => this.nextQuestion(rating.toString()), 400);
                };
                stars.appendChild(star);
            });
            inputContainer.appendChild(stars);
        } else if (q.type === 'binary') {
            ['Yes', 'No'].forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                Object.assign(btn.style, {
                    margin: '10px', padding: '10px 30px',
                    fontSize: '1em', cursor: 'pointer',
                    background: '#333', color: 'white', border: '1px solid #666', borderRadius: '5px'
                });
                btn.onclick = () => this.nextQuestion(opt);
                inputContainer.appendChild(btn);
            });
        } else if (q.type === 'open') {
            const textarea = document.createElement('textarea');
            Object.assign(textarea.style, {
                width: '100%', height: '100px',
                background: '#111', color: 'white', border: '1px solid #555',
                padding: '10px', fontSize: '1em', borderRadius: '5px', marginBottom: '15px'
            });
            inputContainer.appendChild(textarea);

            const submit = document.createElement('button');
            submit.innerText = 'Submit Answer';
            Object.assign(submit.style, {
                padding: '10px 20px', background: '#d93025', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer'
            });
            submit.onclick = () => {
                if (textarea.value.trim().length > 0) this.nextQuestion(textarea.value);
            };
            inputContainer.appendChild(submit);
        }

        card.appendChild(inputContainer);
        this.container.appendChild(card);
    }

    private async nextQuestion(answer: string) {
        const currentQ = this.questions[this.currentIndex];

        // Broadcast to Moderator
        if (this.context?.realtime) {
            this.context.realtime.connect().emit('moderator_event', {
                type: 'survey_answer',
                question: currentQ.text,
                answer: answer,
                timestamp: Date.now()
            });
        }

        // Check for Gemini follow-up
        if (currentQ.type === 'open' && currentQ.followUpEnabled && !currentQ.id.startsWith('follow_up')) {
            const loadingMsg = document.createElement('p');
            loadingMsg.innerText = 'Gemini is analyzing your response...';
            loadingMsg.style.color = '#aaa';
            loadingMsg.style.marginTop = '20px';
            this.container?.querySelector('div')?.appendChild(loadingMsg);

            const followUpText = await this.moderator.analyzeResponse(currentQ.text, answer);
            loadingMsg.remove();

            if (followUpText) {
                // Insert follow-up question
                const followUpQ: Question = {
                    id: `follow_up_${Date.now()}`,
                    text: followUpText,
                    type: 'open'
                };
                this.questions.splice(this.currentIndex + 1, 0, followUpQ);
            }
        }

        this.currentIndex++;
        this.showQuestion();
    }

    async triggerIntervention(question: string) {
        if (this.isOpen) return; // Don't interrupt if survey already open
        this.isOpen = true;

        // Create temporary "intervention" question type
        const interventionQ: Question = {
            id: `intervention_${Date.now()}`,
            text: question,
            type: 'open'
        };

        // We temporarily replace the start logic to just show this one question
        this.renderOverlay();
        this.showInterventionQuestion(interventionQ);
    }

    private showInterventionQuestion(q: Question) {
        if (!this.container) return;
        this.container.innerHTML = '';

        const card = document.createElement('div');
        Object.assign(card.style, {
            backgroundColor: '#222', padding: '30px', borderRadius: '12px',
            maxWidth: '500px', width: '90%', textAlign: 'center',
            border: '2px solid #d93025' // Highlight with red to indicate urgency/interruption
        });

        const header = document.createElement('h3');
        header.innerText = 'Gemini Observation';
        header.style.color = '#ff6b6b';

        const text = document.createElement('p');
        text.innerText = q.text;
        text.style.fontSize = '1.2em';
        text.style.margin = '20px 0';

        card.appendChild(header);
        card.appendChild(text);

        const inputContainer = document.createElement('div');
        const textarea = document.createElement('textarea');
        Object.assign(textarea.style, {
            width: '100%', height: '80px',
            background: '#111', color: 'white', border: '1px solid #555',
            padding: '10px', fontSize: '1em', borderRadius: '5px', marginBottom: '15px'
        });
        inputContainer.appendChild(textarea);

        const submit = document.createElement('button');
        submit.innerText = 'Send Feedback';
        Object.assign(submit.style, {
            padding: '10px 20px', background: '#d93025', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
        });

        submit.onclick = () => {
            this.container?.remove();
            this.container = null;
            this.isOpen = false;
            // Could capture this in telemetry as well
        };

        inputContainer.appendChild(submit);
        card.appendChild(inputContainer);
        this.container.appendChild(card);
    }

    private showCompletion() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div style="text-align:center; background:#222; padding:40px; border-radius:12px; max-width:500px; width:90%;">
                <h2 style="color:gold;">Study Complete!</h2>
                <p>Thank you for participating in our qualitative research.</p>
                <div style="font-size:3em; margin:20px;">🎁</div>
                <p>You've earned the <strong>Research Contributor</strong> badge.</p>
                <button id="close-study-btn" style="margin-top:20px; padding:10px 20px; font-size:1.1em; cursor:pointer;">Return to Game</button>
            </div>
        `;
        document.getElementById('close-study-btn')?.addEventListener('click', () => {
            this.container?.remove();
            this.container = null;
            this.isOpen = false;
        });
    }
}
