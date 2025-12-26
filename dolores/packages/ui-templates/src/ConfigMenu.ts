/**
 * ConfigMenu Class
 * Renders a nested contextual menu structure for design variables.
 */
export class ConfigMenu {
    private config: any;
    private container: HTMLElement | null = null;

    constructor(config: any) {
        this.config = config;
    }

    // Generate HTML for the nested menu
    renderData(data: any, depth: number = 0): string {
        if (typeof document === 'undefined') return ''; // Safety guard

        let html = `<ul style="list-style: none; padding-left: ${depth * 15}px;">`;

        for (const key in data) {
            const value = data[key];
            const isNested = typeof value === 'object' && value !== null;

            html += `<li style="margin-bottom: 5px;">`;
            if (isNested) {
                html += `<div style="font-weight: bold; cursor: pointer;">▶ ${key}</div>`;
                html += this.renderData(value, depth + 1);
            } else {
                html += `
          <div style="display: flex; justify-content: space-between; width: 200px;">
            <span style="opacity: 0.8;">${key}:</span>
            <input type="text" value="${value}" style="width: 80px; background: #333; color: white; border: none;" />
          </div>
        `;
            }
            html += `</li>`;
        }

        html += `</ul>`;
        return html;
    }

    // CLI Friendly ASCII Tree
    renderCLI(data: any = this.config, prefix: string = ''): string {
        let output = '';
        const entries = Object.entries(data);

        entries.forEach(([key, value], index) => {
            const isLast = index === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = prefix + (isLast ? '    ' : '│   ');

            if (typeof value === 'object' && value !== null) {
                output += `${prefix}${connector}${key}\n`;
                output += this.renderCLI(value, childPrefix);
            } else {
                output += `${prefix}${connector}${key}: ${value}\n`;
            }
        });

        return output;
    }
}
