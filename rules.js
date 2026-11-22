// rules.js  (ES module — works in browser and Node)
export const SCHEMES = [
  {
    id: 'pm-kisan', name: 'PM-KISAN', category: 'farmer',
    benefit: '₹6,000/year income support in 3 instalments',
    cashPerYear: 6000,
    source: 'https://pmkisan.gov.in',
    docs: ['Aadhaar', 'Land records (khatauni)', 'Bank passbook'],
    conditions: [
      { key: 'occupation', in: ['farmer'], why: 'Farmer household',
        blocker: 'PM-KISAN is only for farming families' },
      { key: 'ownsLand', in: ['yes'], why: 'Owns cultivable land',
        blocker: 'PM-KISAN requires cultivable land in the family\'s name' },
      { key: 'incomeBand', in: ['lt1', '1to2_5', '2_5to5'],
        why: 'Below the income-tax threshold',
        blocker: 'Income-tax payers are excluded from PM-KISAN' }
    ]
  },
  {
    id: 'pmfby', name: 'PM Fasal Bima Yojana', category: 'farmer',
    benefit: 'Crop insurance — farmer pays ~2% premium (kharif)',
    cashPerYear: 0, source: 'https://pmfby.gov.in',
    docs: ['Aadhaar', 'Land records', 'Sowing certificate', 'Bank passbook'],
    conditions: [
      { key: 'occupation', in: ['farmer'], why: 'Notified crop grower', blocker: 'Only for farmers growing a notified crop' },
      { key: 'ownsLand', in: ['yes'], why: 'Has insurable land', blocker: 'Needs land under cultivation' }
    ]
  },
  {
    id: 'pmjay', name: 'Ayushman Bharat (PM-JAY)', category: 'health',
    benefit: '₹5 lakh/year family health cover, cashless',
    cashPerYear: 0, source: 'https://pmjay.gov.in',
    docs: ['Aadhaar', 'Ration card', 'Income proof (if asked)'],
    conditions: [
      { key: 'incomeBand', test: (v, p) => ['lt1', '1to2_5'].includes(p.incomeBand) || ['aay', 'phh'].includes(p.rationCard),
        why: (p) => ['aay', 'phh'].includes(p.rationCard)
          ? 'Priority/Antyodaya ration card'
          : 'Low household income',
        blocker: 'PM-JAY targets low-income and priority-ration households' }
    ]
  },
  {
    id: 'vay-vandana', name: 'Ayushman Vay Vandana (70+)', category: 'health',
    benefit: '₹5 lakh/year health cover for every senior aged 70+',
    cashPerYear: 0, source: 'https://pmjay.gov.in',
    docs: ['Aadhaar', 'Age proof'],
    conditions: [
      { key: 'age', test: (v) => v >= 70, why: 'Aged 70 or above',
        blocker: 'Only for seniors aged 70 and above' }
    ]
  },
  {
    id: 'ujjwala', name: 'PM Ujjwala Yojana', category: 'women',
    benefit: 'Free LPG connection + subsidised refills',
    cashPerYear: 0, source: 'https://pmuy.gov.in',
    docs: ['Aadhaar', 'Ration card', 'Bank passbook', 'Address proof'],
    conditions: [
      { key: 'gender', in: ['female'], why: 'Adult woman in the household', blocker: 'Connections are issued in an adult woman\'s name' },
      { key: 'age', test: (v) => v >= 18, why: 'Adult', blocker: 'Applicant must be 18+' },
      { key: 'incomeBand', in: ['lt1', '1to2_5'], why: 'Low-income household', blocker: 'For BPL / low-income households' }
    ],
    extraProof: ['No existing LPG connection in the household']
  },
  {
    id: 'surya-ghar', name: 'PM Surya Ghar: Muft Bijli', category: 'energy',
    benefit: 'Rooftop solar subsidy up to ₹78,000 + up to 300 free units/month',
    cashPerYear: 0, source: 'https://pmsuryaghar.gov.in',
    docs: ['Aadhaar', 'Electricity bill', 'Roof ownership proof', 'Bank passbook'],
    conditions: [
      { key: 'ownsHouse', in: ['yes'], why: 'Owns the roof', blocker: 'Needs your own roof to install panels' }
    ],
    extraProof: ['A valid electricity connection at the address']
  },
  {
    id: 'pmayg', name: 'PMAY-Gramin', category: 'housing',
    benefit: 'Assistance to build a pucca house (rural)',
    cashPerYear: 0, source: 'https://pmayg.nic.in',
    docs: ['Aadhaar', 'Job card / SECC reference', 'Bank passbook', 'Land papers (if any)'],
    conditions: [
      { key: 'location', in: ['rural'], why: 'Rural household', blocker: 'PMAY-G is the rural housing scheme' },
      { key: 'ownsHouse', in: ['no'], why: 'No pucca house', blocker: 'For families without a pucca house' },
      { key: 'incomeBand', in: ['lt1', '1to2_5'], why: 'Low-income household', blocker: 'Targets low-income rural families' }
    ]
  },
  {
    id: 'mgnrega', name: 'MGNREGA Job Card', category: 'work',
    benefit: 'Up to 100 days of guaranteed wage work per year',
    cashPerYear: 0, source: 'https://nrega.nic.in',
    docs: ['Aadhaar', 'Bank passbook', 'Photograph', 'Address proof'],
    conditions: [
      { key: 'location', in: ['rural'], why: 'Rural resident', blocker: 'Rural scheme' },
      { key: 'age', test: (v) => v >= 18, why: 'Adult', blocker: 'Must be 18+' },
      { key: 'occupation', in: ['labourer', 'farmer', 'unemployed', 'homemaker'],
        why: 'Available for manual work', blocker: 'For those seeking unskilled manual work' }
    ]
  },
  {
    id: 'apy', name: 'Atal Pension Yojana', category: 'pension',
    benefit: 'Pension of ₹1,000–₹5,000/month after age 60',
    cashPerYear: 0, source: 'https://npscra.nsdl.co.in',
    docs: ['Aadhaar', 'Savings bank account', 'Mobile number'],
    conditions: [
      { key: 'age', test: (v) => v >= 18 && v <= 40, why: 'In the 18–40 entry window', blocker: 'Entry age is 18 to 40' },
      { key: 'hasBankAccount', in: ['yes'], why: 'Has a savings account', blocker: 'Needs a savings bank account' },
      { key: 'incomeBand', in: ['lt1', '1to2_5'], why: 'Unorganised-sector income band', blocker: 'For unorganised-sector workers below the tax threshold' }
    ]
  },
  {
    id: 'nsp-scholarship', name: 'National Scholarship Portal', category: 'education',
    benefit: 'Pre-matric / post-matric scholarships (amount varies by scheme)',
    cashPerYear: 0, source: 'https://scholarships.gov.in',
    docs: ['Aadhaar', 'Previous marksheet', 'Bank passbook', 'Institute certificate'],
    conditions: [
      { key: 'occupation', in: ['student'], why: 'Currently studying', blocker: 'For students only' },
      { key: 'incomeBand', in: ['lt1', '1to2_5'], why: 'Low family income', blocker: 'Family income caps apply' }
    ],
    extraProof: ['SC / ST / OBC / Minority certificate, if applicable']
  },
  {
    id: 'sukanya', name: 'Sukanya Samriddhi Yojana', category: 'girls',
    benefit: 'High-interest savings account for a girl child (tax-free)',
    cashPerYear: 0, source: 'https://www.indiapost.gov.in',
    docs: ['Girl\'s birth certificate', 'Guardian Aadhaar', 'Guardian bank account'],
    conditions: [
      { key: 'gender', in: ['female'], why: 'Girl child', blocker: 'For girls only' },
      { key: 'age', test: (v) => v < 10, why: 'Under 10 years old', blocker: 'Account must be opened before age 10' }
    ]
  }
];

const val = (x, p) => (typeof x === 'function' ? x(null, p) : x);

export function evaluate(scheme, person) {
  const why = [], blockers = [], missing = [];
  let hardFail = false;
  
  for (const c of scheme.conditions) {
    const v = person[c.key];
    
    // Tri-state logic for uncertain answers
    if (v === 'unsure') {
      blockers.push(`Needs verification: ${c.key}`);
      continue; 
    }
    
    if (v === undefined || v === null || v === '') { 
      missing.push(c.key); 
      continue; 
    }
    
    const ok = c.in ? c.in.includes(v) : c.test(v, person);
    if (ok) { 
      if (c.why) why.push(val(c.why, person)); 
    } else {
      if (c.blocker) blockers.push(val(c.blocker, person));
      if (!c.soft) hardFail = true;
    }
  }
  
  const status = hardFail ? 'no' : (missing.length || blockers.length) ? 'possible' : 'likely';
  return { id: scheme.id, scheme, status, why, blockers, missing };
}
export function planForPerson(person) {
  const rank = { likely: 0, possible: 1, no: 2 };
  return SCHEMES.map((s) => evaluate(s, person))
    .filter((r) => r.status !== 'no')
    .sort((a, b) => rank[a.status] - rank[b.status]
      || (b.scheme.cashPerYear || 0) - (a.scheme.cashPerYear || 0));
}

export function householdPlan(household) {
  const people = household.map((p) => ({ person: p, results: planForPerson(p) }));
  const docs = new Set();
  let cashPerYear = 0, likely = 0;
  for (const { results } of people) {
    for (const r of results) {
      r.scheme.docs.forEach((d) => docs.add(d));
      if (r.status === 'likely') { likely++; cashPerYear += r.scheme.cashPerYear || 0; }
    }
  }
  return { people, documents: [...docs].sort(), cashPerYear, likely };
}

export function shareText(household) {
  const plan = householdPlan(household);
  const lines = ['*MyScheme Plan* — indicative only, verify before applying', ''];
  for (const { person, results } of plan.people) {
    lines.push(`👤 ${person.name || 'Member'} (${person.age || '?'})`);
    if (!results.length) lines.push('  • No schemes matched the details entered');
    for (const r of results) {
      lines.push(`  • ${r.scheme.name} — ${r.status}`);
      lines.push(`    ${r.scheme.benefit}`);
    }
    lines.push('');
  }
  if (plan.cashPerYear) lines.push(`💰 Indicative cash support: ~₹${plan.cashPerYear.toLocaleString('en-IN')}/year (excludes insurance covers)`);
  lines.push(`📄 Documents to gather: ${plan.documents.join(', ')}`);
  lines.push('');
  lines.push('Generated offline — no personal data left the device.');
  return lines.join('\n');
}
