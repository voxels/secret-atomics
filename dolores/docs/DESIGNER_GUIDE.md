# Dolores Workbench: Designer's Guide
**"Vibe Coding" for High-Fidelity Experiments**

## 1. What is this?
The **Dolores Workbench** is your "God Mode" simulation environment. It allows you to prototype Reddit experiments, test virtual economies, and visualize "Dark Signals" (user frustration) locally, without waiting for engineering deployments.

## 2. Quick Start (Browser Mode)
To see the "Vibe Coding" menu and interact with the game visually:

1.  Open your terminal.
2.  Run: `npm run dev --workspace=apps/pixel-placer`
3.  Open the link shown (usually `http://localhost:3000`).

*Note: The CLI mode (`npm start`) is still available for headless testing.*

## 3. "Vibe Coding" (Configuring the App)
We have exposed all design variables in a central configuration file. You can tweak animations, colors, copy, and game mechanics without touching the code.

**File Location:** `packages/mock-harness/design-config.json`

### What you can change:
The config is organized into **Nested Contextual Menus**:
*   **Gameplay**: Timer durations, cooldowns, limits.
*   **Visuals**: Animation speeds, color palettes.
*   **Copy**: Text for onboarding, errors, and buttons.

**Example:**
```json
{
  "Visuals": {
    "Animations": {
      "placePixelDuration": 300, <-- Change to 1000 for slow-motion testing
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    "Colors": {
      "primary": "#FF4500",      <-- Paste your hex code here
      "error": "#FF0000"
    }
  }
}
```
*Action: Save the file and your app will update on the next restart.*

## 4. Controlling the Economy
You can also change the price and scarcity of virtual goods.

**File Location:** `packages/mock-harness/products.json`

## 4. Understanding "Dark Signals"
The **Debug Overlay** (visible in your experimental app) shows you invisible user behaviors:

*   **Rage Clicks**: Rapid, frustrated clicking. If you see this count go up, your UI might be unresponsive or confusing.
*   **Dead Clicks**: Clicks on things that *look* interactive but aren't.
*   **Active Dwell Time**: How long the user is *actually* looking at your experiment (not just having the tab open).

## 5. Testing the "Gold Gate"
We have a standard template called `GoldGate` for testing premium features.

*   **Control vs. Treatment**: The simulator randomly assigns you to a bucket.
    *   **Control**: You see normal prices.
    *   **Treatment**: You see a **20% discount**.
*   **Verification**: Check the Debug Overlay to see which `Bucket` you are in. Restart the app a few times to see both variations.

## 7. Testing & Verification

### A. The "Vibe Coding" Menu
In the browser, verify the **Config Menu** (top-left).
*   **Action**: Expand "Visuals > Colors" and check the `primary` color.
*   **Test**: Change a value in `design-config.json` and see if you can verify the change in the menu (requires checking the new value after restart).

### B. Triggering "Rage Clicks"
Test the frustration telemetry safely:
1.  Refresh the app.
2.  Click any pixel **5 times fast** (mash it!).
3.  **Result**: The screen should shake, and the "Rage Clicks" counter in the **Debug Overlay** (bottom-left) should go up.

### C. Testing Persistence
The simulator remembers its state just like the real game.
1.  Place a few pixels (draw a pattern).
2.  Refresh the page.
3.  **Result**: Your pattern should still be there.

### D. Testing Multiplayer (Realtime)
1.  Open `http://localhost:3000` in **two separate tabs** (or windows).
2.  Place a pixel in Tab A.
3.  **Result**: It should instantly appear in Tab B.
