export class GeminiModerator {
    private static instance: GeminiModerator;

    private constructor() { }

    static getInstance(): GeminiModerator {
        if (!GeminiModerator.instance) {
            GeminiModerator.instance = new GeminiModerator();
        }
        return GeminiModerator.instance;
    }

    async analyzeResponse(question: string, answer: string): Promise<string | null> {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 800));

        // Only ask follow-up for longer, thoughtful answers (simulated)
        if (answer.split(' ').length < 5) return null;

        const lowerAnswer = answer.toLowerCase();

        // 1. Color/Palette related
        if (lowerAnswer.includes('color') || lowerAnswer.includes('palette') || lowerAnswer.includes('red') || lowerAnswer.includes('blue')) {
            return "Interesting choice of colors. Did you find the current palette sufficient for your expression?";
        }

        // 2. Grid/Size related
        if (lowerAnswer.includes('grid') || lowerAnswer.includes('size') || lowerAnswer.includes('small') || lowerAnswer.includes('big')) {
            return "How would a different grid size change your strategy?";
        }

        // 3. Placing/Clicking related
        if (lowerAnswer.includes('click') || lowerAnswer.includes('place') || lowerAnswer.includes('mouse') || lowerAnswer.includes('tap')) {
            return "Did the interaction feel responsive enough during rapid placement?";
        }

        // 4. Feature requests
        if (lowerAnswer.includes('feature') || lowerAnswer.includes('add') || lowerAnswer.includes('wish')) {
            return "If we added that feature, what is the first thing you would build with it?";
        }

        // Default generic follow-ups for thoughtful answers without specific keywords
        const generics = [
            "Can you elaborate a bit more on that?",
            "That's a unique perspective. Why do you feel that way?",
            "How did that impact your overall decision making?"
        ];

        return generics[Math.floor(Math.random() * generics.length)];
    }

    async generateRageClickIntervention(): Promise<string> {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 300));

        const interventions = [
            "It seems like you're clicking quite rapidly. Is the interface not responding as you expect?",
            "I noticed some rapid interaction. Are you experiencing any frustration with the pixel placement?",
            "Whoa, those were some fast clicks! Did something unexpected happen with the board?",
            "Is everything working okay? I detected some intense clicking just now."
        ];

        return interventions[Math.floor(Math.random() * interventions.length)];
    }
}
