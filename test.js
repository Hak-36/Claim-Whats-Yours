const assert = require("assert");
const { buildPlan, shareText } = require("./rules");

// Farmer who owns land, age 45, middle income, not enrolled
const farmer = { age: 45, income: "middle", occupation: "farmer", ownsFarmland: true, enrolled: {} };
let plan = buildPlan(farmer);
assert.deepStrictEqual(plan.map((p) => p.id), ["pm-kisan"]);
assert.strictEqual(plan[0].status, "likely");
assert.ok(plan[0].nextStep.includes("New Farmer Registration"), "unenrolled farmer should see registration step");

// Same farmer, already enrolled: branch changes to status check
const enrolledFarmer = { ...farmer, enrolled: { "pm-kisan": true } };
assert.ok(buildPlan(enrolledFarmer)[0].nextStep.includes("Know Your Status"));

// Tenant who does not own land is not matched to PM-KISAN
const tenant = { age: 45, income: "low", occupation: "farmer", ownsFarmland: false, enrolled: {} };
assert.ok(!buildPlan(tenant).some((p) => p.id === "pm-kisan"));

// Low-income non-farmer under 70: possible family cover only, with a 'why' reason
const worker = { age: 30, income: "low", occupation: "other", ownsFarmland: false, enrolled: {} };
plan = buildPlan(worker);
assert.deepStrictEqual(plan.map((p) => p.id), ["pmjay-family"]);
assert.strictEqual(plan[0].status, "possible");
assert.ok(plan[0].why.includes("only a possible match"));

// Age 72, high income: senior cover likely, family cover not shown
const senior = { age: 72, income: "high", occupation: "other", ownsFarmland: false, enrolled: {} };
assert.deepStrictEqual(buildPlan(senior).map((p) => p.id), ["pmjay-senior"]);

// Every item has documents, blockers, an official https URL and a timing note
for (const p of buildPlan({ ...farmer, age: 72, income: "low" })) {
  assert.ok(p.documents.length > 0);
  assert.ok(p.blockers.length > 0);
  assert.ok(p.officialUrl.startsWith("https://"));
  assert.ok(p.timing);
}

// Share text includes the key facts and the disclaimer
const text = shareText(buildPlan(farmer));
assert.ok(text.includes("PM-KISAN") && text.includes("Documents:") && text.includes("Confirm on the official portal"));

// Missing or invalid age returns an empty plan
assert.deepStrictEqual(buildPlan({ income: "low" }), []);
assert.deepStrictEqual(buildPlan({ age: -1 }), []);

console.log("All tests passed");
