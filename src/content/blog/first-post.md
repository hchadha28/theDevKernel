---
title: "From Waiting to Instant: The Story Behind Vite's Speed"
description: "Learn how browser evolution reshaped web development—from why Create React App was once essential to how Vite was born to harness modern browser capabilities."
pubDate: 'Nov 10 2024'
heroImage: '../../assets/blog-placeholder-4.jpg'
---

In this post, we'll learn how browser evolution reshaped web development—from why Create React App was once essential to how Vite was born to harness modern browser capabilities.

### Why Does Vite Start Instantly When Create React App Takes 30 Seconds?

#### Prerequisites

To get the most out of this post, you should have basic familiarity with React and have used `create-react-app` or `vite` at least once. That's it. We'll build up the rest together.

---

If you've been in the React world for any length of time, your journey probably started with one command: 

```bash
npx create-react-app my-app
```

For years, **Create React App (CRA)** was the official and widely-loved way to start a new React project. You ran one command, and *poof*, you had a production-ready app with a dev server, hot-reloading, and build optimizations, all with zero configuration.

Then came **Vite** (pronounced "veet," French for "quick"), promising something that sounded almost too good to be true: a development server that starts **instantly**.

You've probably experienced this contrast. You run `npx create-react-app my-app`, check your phone, browse a tab or two, and return to see your development server *finally* starting up. Then you try Vite:

```bash
npm create vite@latest
npm run dev
```

Before you've even processed what happened, it's running.

This raises the central question: **What changed that made Vite possible?** This isn't about Vite being "lighter" or "removing features"—it's about understanding why we needed CRA's heavy approach in the first place, what fundamentally changed in the browser landscape, and how Vite was born from that change.

---

### The Old World: Why CRA Had to Exist

To understand why Vite is possible now, we need to understand the problem CRA was solving. Let's look at a fresh CRA project. You have a nearly empty `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>...</head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

And your code starts in `src/index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
```

Here's the mystery: The HTML has no `<script>` tag. How does this code run?

The answer reveals the fundamental constraint of the old browser world: **browsers couldn't understand any of this code**. Look at what we're asking the browser to do:

```javascript
import React from 'react';        // Browser: "What's 'import'?"
import './index.css';             // Browser: "CSS in JavaScript?"
import App from './App';          // Browser: "Where's the .js extension?"
root.render(<App />);             // Browser: "What's this <App /> syntax?"
```

Before 2015, browsers only understood one thing: `<script>` tags that loaded complete JavaScript files. They had no concept of:

- Module systems (`import`/`export`)
- JSX syntax
- CSS-in-JS
- Modern JavaScript features (arrow functions, destructuring, async/await)

This is why **Webpack** existed, and why CRA wrapped it. When you run `npm start`, CRA's `react-scripts` does this entire transformation:

1. Reads your `src/index.js` as the entry point  
2. Finds *every* `import` statement recursively  
3. Pulls in all dependencies from `node_modules`  
4. **Transpiles** JSX to `React.createElement()` calls  
5. **Converts** modern JavaScript to ES5 that all browsers understand  
6. **Bundles** everything into one giant `bundle.js` file  
7. Starts a server and injects `<script src="/bundle.js"></script>` into your HTML  

This was **necessary**. Without this bundling step, your code simply wouldn't run in browsers. The 15-30 second wait wasn't inefficiency—it was the cost of making your modern code browser-compatible.

---

### The Shift: How Browsers Evolved (2015-2020)

Between 2015 and 2020, something fundamental happened: **browsers started to evolve**.

#### Phase 1: The ES6 Revolution (2015)

ECMAScript 2015 (ES6) introduced `import`/`export` as part of the JavaScript specification. But browsers didn't support it yet.

```javascript
import { something } from './file.js'
export const value = 42
```

Tools like Babel and Webpack became *mandatory* to bridge this gap.

#### Phase 2: Native Module Support (2017-2020)

Major browsers started implementing native ES Module support:

- **Chrome 61** (September 2017)  
- **Firefox 60** (May 2018)  
- **Safari 11** (September 2017)  
- **Edge 16** (October 2017)

```html
<script type="module" src="/main.js"></script>
```

And inside `main.js`:

```javascript
import { helper } from './helper.js'  // Browser natively resolves this!
```

**Before (Pre-2017):**

```html
<!-- The ONLY way browsers understood code -->
<script src="bundle.js"></script>
<!-- Everything had to be in ONE file -->
```

**After (2017+):**

```html
<!-- Browsers can now load modules on-demand -->
<script type="module" src="/main.js"></script>
<!-- main.js can import other files, which can import others... -->
```

#### Phase 3: Modern JavaScript Support (2018-2020)

Browsers started supporting modern JavaScript features natively:

- Arrow functions
- Destructuring
- Async/await
- Optional chaining
- Classes

By 2020, the browser world was completely different from 2015. The constraints that made Webpack necessary were disappearing.

---

### The Birth of Vite: Rethinking Development

In early 2020, Evan You (creator of Vue.js) had a realization:  
**If browsers can now handle modules natively, why are we still bundling during development?**

Vite's philosophy: **During development, don't bundle. Let the browser do what it's now capable of doing.**

```html
<!DOCTYPE html>
<html lang="en">
  <head>...</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

That `type="module"` attribute tells the browser: "This is an ES Module. You know how to handle this now."

---

### How Vite Works: The On-Demand Transform

Vite transforms code **only when the browser requests it**.

#### Step 1: Server Starts (Instantly)

```bash
npm run dev
```

The server starts immediately—it hasn't compiled anything yet.

#### Step 2: Browser Requests HTML

```
Browser → Vite: "GET /"
Vite → Browser: [sends index.html as-is]
```

#### Step 3: Browser Requests the Entry Module

```javascript
// src/main.jsx (on your disk)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Vite transforms it on-the-fly using **esbuild**:

```javascript
// What Vite sends to the browser
import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=abc123"
const React = __vite__cjsImport0_react.__esModule ? __vite__cjsImport0_react.default : __vite__cjsImport0_react
import __vite__cjsImport1_reactDom from "/node_modules/.vite/deps/react-dom_client.js?v=abc123"
const ReactDOM = __vite__cjsImport1_reactDom.__esModule ? __vite__cjsImport1_reactDom.default : __vite__cjsImport1_reactDom
import App from "/src/App.jsx"
import "/src/index.css"

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  )
)
```

---

### The Key Insight: Two Different Bottlenecks

**Development (localhost):**  
- Network latency: ~0ms  
- Real bottleneck: Build/bundle time

**Production (real users):**  
- Network latency: ~50–200ms  
- Real bottleneck: Number of HTTP requests

CRA bundled for both environments. Vite doesn't—it treats them differently.

**Vite's Development Strategy:**

```
You edit App.jsx
↓
Vite recompiles ONLY App.jsx (~1ms)
↓
Browser requests ONLY the changed module
↓
HMR updates instantly
```

**Vite's Production Strategy:**

```
You run npm run build
↓
Vite switches to Rollup
↓
Creates optimized, bundled files
↓
Minimizes HTTP requests for users
```

---

### Why Vite Needed the Browser Evolution

Vite couldn't have existed before 2020 because:

1. **No native ES modules (pre-2017):** Browsers required bundling.  
2. **No modern JS support (pre-2018):** Needed transpilation to ES5.  
3. **No fast build tools (pre-2020):** esbuild made instant transforms possible.

CRA was right for 2016. Vite is right for modern browsers.

---

### Quick Revision: The Evolution Story

**Q: Why was bundling necessary in 2016?**  
A: Browsers couldn't understand `import` statements, JSX, or modern JavaScript.

**Q: What changed between 2017–2020?**  
A: Native ES Modules, modern JS support, and esbuild.

**Q: How does Vite leverage these changes?**  
A: It serves files on-demand using native ES modules and transforms only what's needed.

**Q: Why does Vite still bundle for production?**  
A: To minimize HTTP requests for real users.

**Q: Could Vite have existed in 2016?**  
A: No. The browser ecosystem wasn't ready.

**Q: What's the difference between CRA and Vite?**  
A: CRA was built for 2016's browser world. Vite was built for 2020+ browsers.