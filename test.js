// test.js  — run with:  node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, planForPerson, householdPlan, shareText, SCHEMES } from './rules.js';

const byId = (id) => SCHEMES.find((s) => s.id === id);
const statusOf = (person, id) => evaluate(byId(id), person).status;

test('senior 70+ gets Vay Vandana, 60-year-old does not', () => {
  const senior = { age: 72, gender: 'male', location: 'rural', occupation: 'retired', incomeBand: '1to2_5', ownsLand: 'yes', ownsHouse: 'yes', rationCard: 'phh', hasBankAccount: 'yes' };
  assert.equal(statusOf(senior, 'vay-vandana'), 'likely');
  assert.equal(statusOf({ ...senior, age: 60 }, 'vay-vandana'), 'no');
});

test('tenant farmer is excluded from PM-KISAN with a land blocker', () => {
  const tenant = { age: 40, gender: 'male', location: 'rural', occupation: 'farmer', incomeBand: 'lt1', ownsLand: 'no', ownsHouse: 'no', rationCard: 'aay', hasBankAccount: 'yes' };
  const r = evaluate(byId('pm-kisan'), tenant);
  assert.equal(r.status, 'no');
  assert.ok(r.blockers.some((b) => /land/i.test(b)));
});

test('missing detail downgrades to "possible", not "likely"', () => {
  assert.equal(statusOf({ occupation: 'farmer' }, 'pm-kisan'), 'possible');
});

test('PM-JAY OR-logic: high income but AAY card still qualifies', () => {
  assert.equal(statusOf({ incomeBand: 'gt5', rationCard: 'aay' }, 'pmjay'), 'likely');
  assert.equal(statusOf({ incomeBand: 'gt5', rationCard: 'none' }, 'pmjay'), 'no');
});

test('girl child under 10 matches Sukanya; 12-year-old does not', () => {
  assert.equal(statusOf({ gender: 'female', age: 5 }, 'sukanya'), 'likely');
  assert.equal(statusOf({ gender: 'female', age: 12 }, 'sukanya'), 'no');
});

test('household plan deduplicates documents and sums indicative cash', () => {
  const household = [
    { name: 'A', age: 45, gender: 'male', location: 'rural', occupation: 'farmer', incomeBand: 'lt1', ownsLand: 'yes', ownsHouse: 'yes', rationCard: 'phh', hasBankAccount: 'yes' },
    { name: 'B', age: 42, gender: 'female', location: 'rural', occupation: 'homemaker', incomeBand: 'lt1', ownsLand: 'no', ownsHouse: 'yes', rationCard: 'phh', hasBankAccount: 'yes' }
  ];
  const plan = householdPlan(household);
  assert.equal(new Set(plan.documents).size, plan.documents.length);
  assert.equal(plan.cashPerYear, 6000);
});

test('share text carries the disclaimer and stays WhatsApp-sized', () => {
  const text = shareText([{ name: 'Ramesh', age: 62, gender: 'male', location: 'rural', occupation: 'farmer', incomeBand: 'lt1', ownsLand: 'yes', ownsHouse: 'yes', rationCard: 'phh', hasBankAccount: 'yes' }]);
  assert.match(text, /verify/i);
  assert.match(text, /no personal data/i);
  assert.ok(text.length < 4000);
});

test('no scheme throws on an empty person', () => {
  for (const s of SCHEMES) assert.doesNotThrow(() => evaluate(s, {}));
});
