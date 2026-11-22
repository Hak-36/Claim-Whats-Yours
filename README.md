# Claim What's Yours

**Problem:** Eligible people miss government support because finding a scheme is only the first step. The paperwork, documents, and "am I already registered?" steps stop most people.

**Solution:** A household claim planner. For each person it shows which schemes they may qualify for, whether they are already registered, the documents to bring, what could block them, and when payments arrive. It turns the plan into text the user can send to family or a community helper.

## Why this is different from existing tools

- **myScheme (myscheme.gov.in)** is the official national platform with 4,000+ schemes and an eligibility check. It finds schemes well. Claim What's Yours is built for the step after discovery: a per-person checklist, enrolment status branching, household view, and a shareable plan.
- **Accuracy and transparency.** Every match shows "why", "what could block you", and an official source with the date the rules were reviewed. Matches are labeled "likely" or "possible" depending on how much a short quiz can actually determine.
- **Built for households.** One person may be a farmer, another a senior, and another a low-income worker. The app checks everyone in one pass.
- **Privacy by design.** Nothing is stored or sent. The app runs in the browser.

## Schemes covered

| Scheme | Who it's for | Official source |
|---|---|---|
| PM-KISAN Samman Nidhi | Landholding farmer families | pmkisan.gov.in |
| Ayushman Bharat PM-JAY (70+) | Senior citizens 70 and above | pmjay.gov.in |
| Ayushman Bharat PM-JAY (family) | Low-income households (possible match) | pmjay.gov.in |

## Run it

Open `index.html` in a browser, or run:
```bash
python3 -m http.server 8000
```
then visit http://localhost:8000

## Test the rules

```bash
node test.js
```
Expected output:
```
All tests passed
```

## Files

- `index.html`: household form, results, and copy-to-share
- `rules.js`: scheme rules, claim plans, and share text
- `test.js`: tests for matching, enrolment branching, and share text

## Limitations

- Three schemes covered. Next: state schemes (starting with Andhra Pradesh) and central scholarships, each with a verified official source.
- Rules are screening guidance. The official portals make final decisions.
- Telugu and Hindi language support is planned.

## Next steps

- Add state schemes and verify each one against official sources
- Add Telugu and Hindi
- Add reminders for installment dates
