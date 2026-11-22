# Claim What's Yours

**A household scheme planner for India.** Discovery portals stop at *"here's a scheme."* We start there.

🔗 **Live demo:** https://hak-36.github.io/Claim-Whats-Yours/  

<!-- Drop a screenshot of the results screen right here -->
<!-- ![Results screen](docs/results.png) -->

---

## The problem

A rural household in Andhra Pradesh may be eligible for **six or more central schemes** and typically knows about **one**. Existing portals (myScheme, state portals) are *scheme-first*: you search, you read, you decide. Households — especially those using a CSC operator or a relative's phone — need a *family-first* answer: **"Given who we are, what should we apply for, in what order, and what papers do we need?"**

## What this does

1. **Add each family member** in a 10-question wizard (name, age, gender, location, occupation, income band, land, house, ration card, bank account).
2. **Get a per-person plan** — every match is labelled `likely` or `possible`, with the **reason** for the match and the **blocker** for schemes that don't fit.
3. **See the household snapshot** — schemes the family likely qualifies for, indicative annual cash support, and a **deduplicated document checklist** covering everyone.
4. **Share on WhatsApp** — one formatted message with the plan, the docs list, and the disclaimer. Send it to a relative or a CSC operator.

**Nothing is uploaded. All matching runs in the browser. No accounts, no analytics, no cookies.**

---

## Why judges can trust the output

Every match is traceable to a declarative condition in [`rules.js`](rules.js). Each condition has three parts a judge can read:

- `why` — the plain-English reason shown when the condition passes
- `blocker` — the plain-English reason shown when it fails
- `source` — the official portal URL for that scheme

Example (PM-KISAN):

```js
{
  key: 'ownsLand', in: ['yes'],
  why: 'Owns cultivable land',
  blocker: 'PM-KISAN requires cultivable land in the family\'s name'
}
