// Claim What's Yours - matching rules and claim plans for Indian government schemes.
// Results are screening guidance, not eligibility decisions. Confirm on the
// official portal before acting. Rules reviewed: 2026-11-22.

const PROGRAMS = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    benefit: "₹6,000 a year in three instalments, paid directly to your bank account.",
    officialUrl: "https://pmkisan.gov.in",
    // Landholding farmer families. Aadhaar and e-KYC are mandatory.
    why(a) {
      return "You answered that you are a farmer who owns cultivable land in your name.";
    },
    match(a) {
      return a.occupation === "farmer" && a.ownsFarmland;
    },
    blockers: [
      "Land records must show ownership in your name (scheme guidelines use a 1 February 2019 land-record cut-off).",
      "Some higher-income and institutional landholding categories are excluded under the official guidelines.",
      "Aadhaar seeding and e-KYC must be completed, or payments can be held back.",
    ],
    documents: ["Aadhaar card", "Bank account linked to Aadhaar", "Land ownership records (khasra/khatauni or equivalent)"],
    enrolled: {
      yes: "Check your payment and e-KYC status: pmkisan.gov.in > Farmers Corner > Know Your Status. Enter your registration number.",
      no: "Register at pmkisan.gov.in > Farmers Corner > New Farmer Registration. Or visit a Common Service Centre for help.",
    },
    timing: "Paid in three instalments a year (roughly April–July, August–November, December–March).",
  },
  {
    id: "pmjay-senior",
    name: "Ayushman Bharat PM-JAY (senior citizens 70+)",
    benefit: "Up to ₹5 lakh a year in cashless hospital treatment, regardless of income.",
    officialUrl: "https://pmjay.gov.in",
    why(a) {
      return `You are ${a.age}, which is 70 or above. This group is covered regardless of income.`;
    },
    match(a) {
      return a.age >= 70;
    },
    blockers: [
      "Certain government health schemes (such as CGHS, ECHS, or CAPF) require you to choose between them and PM-JAY.",
    ],
    documents: ["Aadhaar card", "Mobile number linked to Aadhaar (for the OTP check)"],
    enrolled: {
      yes: "Download your card from mera.pmjay.gov.in using your registered mobile number.",
      no: "Use 'Am I Eligible' at pmjay.gov.in, or visit a Common Service Centre, to confirm and get your Ayushman card.",
    },
    timing: "Once confirmed, the card works at empanelled hospitals across India.",
  },
  {
    id: "pmjay-family",
    name: "Ayushman Bharat PM-JAY (family cover)",
    benefit: "Up to ₹5 lakh per family a year in cashless hospital treatment.",
    officialUrl: "https://pmjay.gov.in",
    why(a) {
      return "Your household income is low, and eligibility depends on government database records we cannot see, so this is only a possible match.";
    },
    match(a) {
      return a.age < 70 && a.income === "low";
    },
    blockers: [
      "Eligibility depends on SECC database records and state lists. Your name may not appear even if your income is low.",
      "Income tax payers are generally excluded.",
    ],
    documents: ["Aadhaar card", "Ration card or family ID", "Mobile number linked to Aadhaar"],
    enrolled: {
      yes: "Check your card or beneficiary status at mera.pmjay.gov.in.",
      no: "Use 'Am I Eligible' at pmjay.gov.in with your mobile number and OTP, or ask at a Common Service Centre.",
    },
    timing: "Checking takes a few minutes online. Enrolment is free.",
  },
];

// answers: { age, income: "low"|"middle"|"high", occupation: "farmer"|"other",
//            ownsFarmland: boolean, enrolled: { [programId]: boolean } }
function buildPlan(answers, programs = PROGRAMS) {
  if (!answers || typeof answers.age !== "number" || answers.age < 0) return [];
  const plan = [];
  for (const p of programs) {
    if (!p.match(answers)) continue;
    const likely = p.id !== "pmjay-family";
    const isEnrolled = !!(answers.enrolled && answers.enrolled[p.id]);
    plan.push({
      id: p.id,
      name: p.name,
      status: likely ? "likely" : "possible",
      benefit: p.benefit,
      why: p.why(answers),
      blockers: p.blockers,
      documents: p.documents,
      nextStep: isEnrolled ? p.enrolled.yes : p.enrolled.no,
      timing: p.timing,
      officialUrl: p.officialUrl,
    });
  }
  return plan.sort((x, y) => (x.status === y.status ? 0 : x.status === "likely" ? -1 : 1));
}

// Plain-language summary the user can copy and send to family or a helper.
function shareText(plan) {
  if (plan.length === 0) return "No matches found. Check pmjay.gov.in and pmkisan.gov.in directly.";
  const lines = ["Government schemes to check (Claim What's Yours):"];
  plan.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name} (${p.status === "likely" ? "likely" : "possible"})`);
    lines.push(`   Next step: ${p.nextStep}`);
    lines.push(`   Documents: ${p.documents.join(", ")}`);
    lines.push(`   Official site: ${p.officialUrl}`);
  });
  lines.push("Confirm on the official portal before applying.");
  return lines.join("\n");
}

if (typeof module !== "undefined") {
  module.exports = { PROGRAMS, buildPlan, shareText };
}
