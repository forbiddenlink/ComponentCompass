<!--
DEV.to submission draft for the GitHub Finish-Up-A-Thon.
House rules applied: NO em dashes anywhere. First person. Specific, not hand-wavy.
Replace every TODO before publishing.
Tags to set on DEV: devchallenge, githubchallenge, ai, react
Canonical cover image: 1600x840 (DEV shows ~1000x420). Split screen: screenshot left, rendered component + green a11y score right.
-->

# My AI Tool Generated Garbage JSX. So I Grounded It in shadcn/ui and Finally Shipped It.

*This is a submission for the GitHub Finish-Up-A-Thon Challenge.*

Paste a screenshot of any UI. Get back a real React component that actually runs, reuses your design system instead of reinventing it, shows you exactly what it detected and how sure it was, and comes with an accessibility score you can fix in one click.

That is Trace. A few months ago it was a dead repo. Here is how I finished it.

<!-- Upload docs/demo.gif via the DEV editor (drag-drop) and it becomes a CDN URL. -->
![Trace in action: a login-form screenshot becomes a live, grounded React component with an accessibility score](docs/demo.gif)

> Live demo: https://trace-seven-ashen.vercel.app (try an example, no signup, no API key)
> Code: https://github.com/forbiddenlink/trace

## What I Built

Trace turns a UI screenshot into a runnable React component. The flow:

1. You drop in a screenshot, or click a cached example that needs no key.
2. Google Gemini reads it, grounded in a shadcn style component catalog baked into the prompt, and generates a self contained React and TypeScript component that reuses real components instead of inventing markup.
3. The component renders live and editable in a Sandpack sandbox. That sandbox is the focal point. Edit the code, the preview updates.
4. The "What the AI sees" inspector draws a numbered bounding box on the screenshot for every detected element, maps it to a catalog component and variant, shows a confidence reading, and tags it honestly as grounded, inferred, or guessed.
5. axe-core runs against the rendered output for a 0 to 100 accessibility score and the actual violations. One button asks the model to fix them, and the score climbs.

Most "screenshot to code" tools stop at step 2 and hand you a wall of code that may or may not compile. The things that make Trace different are the parts those tools skip:

- **Design system grounding.** The model is constrained to a real component catalog inside the prompt, so it composes from known parts instead of inventing a new button every time. No vector database, no credentials, just grounding.
- **Trace lines.** This is where the name comes from. Animated draftsman construction lines wire each region of the screenshot to its row in the inspector to its spot in the preview. Hover anything and the matching parts on the other two surfaces light up, so you can always see which pixels became which component.
- **Honest confidence.** It does not pretend to be certain. Every detection is labeled grounded, inferred, or guessed, and you can refine the low confidence ones with one click.
- **It actually runs.** Generated code is compile checked, and if it fails, the error goes back to the model for an automatic repair pass before you ever see it.
- **It grades accessibility, then fixes it.** axe-core scores the rendered component and "Fix accessibility" re-prompts the model to resolve the violations in place. No other screenshot to component tool I found does this. And Trace practices what it preaches: its own interface ships a skip-to-studio link, labeled landmarks, keyboard navigation, and visible focus, and passes an axe-core audit clean. A tool that grades accessibility should not flunk its own.
- **You can talk to it.** Refine the result with a plain language prompt, or scribble notes directly on the screenshot in vermilion and Trace treats the marks as instructions, not as UI to copy.

A draftsman plotter loading sequence narrates the wait: detecting, grounding, drafting, checking accessibility. The whole thing wears a deliberate precision drafting look, vellum and graphite and vermilion, reticle frames and dimension annotations, Space Grotesk and Public Sans. No purple AI gradient grid in sight.

Stack: Vite, React 19, TypeScript, Tailwind, Gemini through the Vercel AI SDK, Sandpack for the live sandbox, axe-core for the accessibility audit, all on a Vercel serverless function with a Vite dev middleware so it runs the same locally.

## Demo

> Live: https://trace-seven-ashen.vercel.app
> Walkthrough GIF below.

![Generate, score, fix](docs/demo.gif)

Fastest way to see it: open the live demo and click an example in the gallery. The examples are preloaded with cached results, so they work instantly with no key and no wait. Then upload your own screenshot to run the real pipeline. There is also a compare slider for screenshot versus render, Copy code, and Open in CodeSandbox.

The short arc that sums it up: paste a screenshot, watch the trace lines wire the detected regions to the live render, and see the accessibility score come back (95 on the login form in the GIF, with one real violation listed). "Fix accessibility" re-prompts the model to clear what axe-core flagged. The GIF above runs the real pipeline end to end, no edits.

## The Comeback Story

I built the first version of this for the Algolia Agent Studio Challenge back in February. Except it was not this. It was a chatbot for searching a component library: ask a question, get a component back. I ran out of time, shelved it, and the last real commit was around May. Then nothing.

When the Finish-Up-A-Thon showed up, I reopened it and realized the search part was never the interesting idea. The thing worth building was turning a screenshot into a component. So the comeback was not "add a few features." It was a full reframe:

- Tore out the component-search chatbot as the main event and made the screenshot to component flow the whole product.
- Dropped Algolia entirely. Grounding the model with an in-prompt catalog turned out simpler, faster, and credential free, which means anyone can run the demo with no key.
- Built the live editable preview, the trace lines, the "What the AI sees" inspector with honest confidence tags, the self repair loop, the axe-core scoring with one-click fix, prompt refinement, and draw-to-instruct. None of that existed before.
- Renamed the whole thing from ComponentCompass to Trace, because "compass" implied search and the product is no longer about search. "Trace" is what it does: it traces a screenshot back to real components, and the trace lines make that literal.

Before: a search chatbot that could not even render a component, abandoned for months. After: a screenshot to component generator that grounds its output, shows its work, runs it live, and grades its accessibility. The git history tells the story, with the dead stretch in the middle and the finish dated to the challenge window.

The finishing-up was not all glamorous. Late in the window I caught the live pipeline failing with "could not parse the response" on real uploads. The cause was subtle: Gemini 2.5 spends "thinking" tokens against the same output budget as the answer, and with the cap I had set it was burning roughly 6800 of 8000 tokens on reasoning and truncating the JSON mid-string before it finished. Capping the thinking budget and raising the output ceiling fixed it. That is the unglamorous reality of finishing an abandoned project: the last bug between "demo works on my machine" and "demo works for a stranger" is often the one you only find by actually shipping.

## My Experience with GitHub Copilot

I tried to keep this part concrete, because "Copilot helped a lot" is not very useful. Three kinds of use, smallest to largest.

**Inline, every day.** The boring-but-real one. React 19 deprecated the old `MutableRefObject` typing pattern I had in `TraceLines.tsx`, and Copilot's inline fix switched those props to the current ref type without me looking it up. Same story for Tailwind class strings, type annotations, and the dozens of small completions that keep me in flow instead of tab-switching to docs. None of it is flashy. All of it adds up.

**Debugging, in chat.** [FILL IN with your real instance, e.g.: When the Sandpack preview was rendering unstyled, I pasted the iframe setup and the symptom into Copilot Chat and worked through why Tailwind was not loading in the sandbox. Describe the bug, what you asked, and what you did with the answer. Keep it specific: a file name and the actual fix beat "it helped me debug."] The pattern that works for me is treating Copilot Chat as a rubber duck that talks back: I describe the symptom and my current theory, and the back-and-forth either confirms it or points at something I had ruled out too early.

**Agent mode, on multi-file work.** The biggest one. I asked it to add test coverage for the new Screenshot Studio features: Vitest coverage for the `friendlyError`, confidence, and grounding logic, plus a Playwright test that loads a gallery example and proves the bounding boxes, trace lines, and accessibility panel render. That change touched `src/components/ScreenshotStudio.tsx`, a new `src/components/ScreenshotStudio.logic.ts`, a new `src/components/ScreenshotStudio.test.tsx`, `src/components/TraceLines.tsx`, and `e2e/app.spec.ts`. It was a good use of Copilot because it was real engineering, not autocomplete: it had to follow the existing test patterns, update stale selectors in the e2e suite, and keep the assertions stable enough to pass.

The most important Copilot moment, though, was where I did **not** take the obvious bigger suggestion. A common AI instinct on the grounding problem is "stuff more data into the prompt" or "add a vector database." I rejected that. In `api/generate.ts` I deliberately keep the catalog grounded in-prompt and cap it with `MAX_CATALOG = 40`. That keeps token cost under control, keeps the demo credential-free, and preserves the core product idea: Trace should work with a small, explicit design-system whitelist, not require more infrastructure just to make the story sound more impressive. Copilot was useful here, but only because I treated it as a collaborator to review, not an authority to obey.

---

*Built with Vite, React, Gemini, Sandpack, and axe-core. MIT licensed. Feedback welcome in the comments.*

<!-- Promotion checklist for the reaction tiebreaker: post before June 4 if possible, cross post to X and the relevant subreddits, reply to every comment fast, make sure the cover image reads at thumbnail size. -->
