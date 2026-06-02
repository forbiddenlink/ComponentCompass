<!--
DEV.to submission draft for the GitHub Finish-Up-A-Thon.
House rules applied: NO em dashes anywhere. First person. Specific, not hand-wavy.
Replace every TODO before publishing.
Tags to set on DEV: devchallenge, githubchallenge, ai, react
Canonical cover image: 1600x840 (DEV shows ~1000x420). Split screen: screenshot left, rendered component + green a11y score right.
-->

# My AI Tool Generated Garbage JSX. So I Grounded It in shadcn/ui and Finally Shipped It.

*This is a submission for the GitHub Finish-Up-A-Thon Challenge.*

Paste a screenshot of any UI. Get back a real React component that actually runs, reuses your design system instead of reinventing it, and comes with an accessibility score you can fix in one click.

That is Trace. Eight months ago it was a dead repo. Here is how I finished it.

![Trace in action](TODO-demo.gif)

> Live demo: https://trace-seven-ashen.vercel.app (try an example, no signup, no API key)
> Code: https://github.com/forbiddenlink/trace

## What I Built

Trace turns a UI screenshot into a runnable React component. The flow:

1. You drop in a screenshot.
2. Google Gemini reads it and tells you what it sees: each detected element mapped to a component and variant, with a confidence score.
3. It generates a self contained React component, grounded in a shadcn style catalog so it reuses real components rather than spitting out generic markup.
4. The component renders live in an editable Sandpack sandbox. Edit the code, the preview updates.
5. axe-core runs against the rendered output and gives it a 0 to 100 accessibility score with the actual violations. One button asks the model to fix them, and the score climbs.

Most "screenshot to code" tools stop at step 3 and hand you a wall of code that may or may not compile. The things that make Trace different are the parts those tools skip:

- **Design system grounding.** The model is constrained to a real component catalog, so it composes from known parts instead of inventing a new button every time.
- **It shows its reasoning.** The "What the AI sees" panel makes the detection legible instead of magic.
- **It actually runs.** Generated code is compile checked, and if it fails, the error goes back to the model for up to two repair passes before you ever see it.
- **It grades accessibility.** No other screenshot to component tool I found checks a11y, let alone fixes it in place.

Stack: Vite, React 19, TypeScript, Tailwind, Gemini through the Vercel AI SDK, Sandpack for the live sandbox, axe-core for the accessibility audit.

## Demo

> Live: https://trace-seven-ashen.vercel.app
> Walkthrough GIF below.

![Generate, score, fix](TODO-demo.gif)

Fastest way to see it: open the live demo and click an example in the gallery. The examples are preloaded with cached results, so they work instantly with no key and no wait. Then upload your own screenshot to run the real pipeline.

The 10 second arc that sums it up: paste a screenshot, watch the component render, see the accessibility score come back at 85, click "Fix accessibility," watch it land at 100.

## The Comeback Story

I built the first version of this for the Algolia Agent Studio Challenge back in February. Except it was not this. It was a chatbot for searching a component library: ask a question, get a component back. I ran out of time, submitted two other projects to that challenge instead, and quietly shelved this one. Last real commit was in early May. Then nothing.

When the Finish-Up-A-Thon showed up, I reopened it and realized the search part was never the interesting idea. Buried in the repo was a half wired feature I had never finished: turning a screenshot into a component. That was the thing worth building. So the comeback was not "add a few features." It was a reframe:

- Ripped out the chatbot as the main event and made the screenshot to component flow the whole product.
- Dropped the hard Algolia dependency. Grounding the model with an in prompt catalog turned out simpler, faster, and credential free, which also means anyone can run the demo.
- Wired up a live preview that had been sitting dead in the codebase, unused.
- Added the self repair loop and the accessibility scoring, which did not exist before at all.
- Renamed the whole thing from ComponentCompass to Trace, because "compass" implied search and the product is no longer about search.

Before: a chatbot that could not even render a component, abandoned for months. After: a screenshot to component generator that grounds its output, runs it live, and grades its accessibility. The git history tells the story, with the dead stretch in the middle and the finish dated to the challenge window.

## My Experience with GitHub Copilot

<!--
TODO Liz: replace this section with 2-3 SPECIFIC, verifiable moments. Generic praise scores worst (it is the #1 weakness across the field). Name the feature and show one real prompt + diff or screenshot. Ideas to capture while you finish the polish work:

1. Agent mode for a multi-file change. Example: "I used Copilot agent mode to thread the repairReason field from the Studio UI through the serverless handler and the dev middleware into the core generate function. It touched four files; I reviewed each edit and rejected the one that ___."

2. A /fix or inline fix on a real bug. Example: "Copilot caught that the axe-core postMessage from the sandboxed iframe never reaches the parent window, and suggested routing through Sandpack's console channel instead." (Only claim this if it actually happened on your machine.)

3. A place you OVERRODE Copilot. Judges trust this more than praise. Example: "Copilot wanted to pull the full component catalog into the prompt. I overrode it and capped the catalog at 40 entries to control tokens."

Include one screenshot of Copilot chat or an inline suggestion, and one short before/after diff.
-->

TODO: 2 to 3 specific Copilot moments (see the comment above for structure and candidates). Show one prompt, one diff, one screenshot. Name the feature you used: agent mode, /fix, inline completion, or custom instructions.

---

*Built with Vite, React, Gemini, Sandpack, and axe-core. MIT licensed. Feedback welcome in the comments.*

<!-- Promotion checklist for the reaction tiebreaker: post before June 4 if possible, cross post to X and the relevant subreddits, reply to every comment fast, make sure the cover image reads at thumbnail size. -->
