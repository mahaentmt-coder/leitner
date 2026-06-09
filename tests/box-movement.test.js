// Box movement tests for Leitner spaced repetition logic
// Run: node tests/box-movement.test.js

// ── Copy core logic from index.html ──────────────────────────────
const BOX_SIZES = [1, 1, 1, 1, 27];
const BOX_INTERVALS = [1, 2, 4, 8, 16, 0];

function getBoxNum(s) {
  let c = 0;
  for (let i = 0; i < BOX_SIZES.length; i++) {
    c += BOX_SIZES[i];
    if (s <= c) return i + 1;
  }
  return 6;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function computeNextReview(currentSection, correct, todayStr) {
  if (!correct) {
    return { section: 1, done: false, next_review: addDays(todayStr, 1) };
  }
  const newSection = currentSection === 31 ? 31 : currentSection + 1;
  const isDone = currentSection === 31;
  const box = getBoxNum(newSection);
  const interval = BOX_INTERVALS[Math.min(box - 1, BOX_INTERVALS.length - 1)];
  const next = isDone ? null : addDays(todayStr, interval);
  return { section: newSection, done: isDone, next_review: next };
}

function isDue(word, todayStr) {
  if (word.done) return false;
  if (!word.next_review) return true;
  return word.next_review <= todayStr;
}

// ── Test runner ───────────────────────────────────────────────────
let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${e.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      const a = JSON.stringify(actual), b = JSON.stringify(expected);
      if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    }
  };
}

const TODAY = '2026-06-08';
const TOMORROW = '2026-06-09';

// ── Box mapping tests ─────────────────────────────────────────────
console.log('\n📦 Box mapping (getBoxNum):');
test('section 1 → box 1', () => expect(getBoxNum(1)).toBe(1));
test('section 2 → box 2', () => expect(getBoxNum(2)).toBe(2));
test('section 3 → box 3', () => expect(getBoxNum(3)).toBe(3));
test('section 4 → box 4', () => expect(getBoxNum(4)).toBe(4));
test('section 5 → box 5', () => expect(getBoxNum(5)).toBe(5));
test('section 10 → box 5', () => expect(getBoxNum(10)).toBe(5));
test('section 31 → box 5', () => expect(getBoxNum(31)).toBe(5));

// ── Correct answer movement ───────────────────────────────────────
console.log('\n✅ Correct answer — box progression:');

test('box 1 correct → moves to section 2 (box 2)', () => {
  const result = computeNextReview(1, true, TODAY);
  expect(result.section).toBe(2);
  expect(getBoxNum(result.section)).toBe(2);
});

test('box 2 correct → moves to section 3 (box 3)', () => {
  const result = computeNextReview(2, true, TODAY);
  expect(result.section).toBe(3);
  expect(getBoxNum(result.section)).toBe(3);
});

test('box 3 correct → moves to section 4 (box 4)', () => {
  const result = computeNextReview(3, true, TODAY);
  expect(result.section).toBe(4);
  expect(getBoxNum(result.section)).toBe(4);
});

test('box 4 correct → moves to section 5 (box 5)', () => {
  const result = computeNextReview(4, true, TODAY);
  expect(result.section).toBe(5);
  expect(getBoxNum(result.section)).toBe(5);
});

test('box 5 correct → stays in box 5 (section increments)', () => {
  const result = computeNextReview(5, true, TODAY);
  expect(result.section).toBe(6);
  expect(getBoxNum(result.section)).toBe(5);
});

// ── Correct answer intervals ──────────────────────────────────────
console.log('\n⏱  Correct answer — next_review intervals:');

test('box 1 correct → moves to box 2 → next review in 2 days', () => {
  const result = computeNextReview(1, true, TODAY);
  expect(result.next_review).toBe(addDays(TODAY, 2)); // now in box 2, interval = 2
});

test('box 2 correct → moves to box 3 → next review in 4 days', () => {
  const result = computeNextReview(2, true, TODAY);
  expect(result.next_review).toBe(addDays(TODAY, 4)); // now in box 3, interval = 4
});

test('box 3 correct → moves to box 4 → next review in 8 days', () => {
  const result = computeNextReview(3, true, TODAY);
  expect(result.next_review).toBe(addDays(TODAY, 8)); // now in box 4, interval = 8
});

test('box 4 correct → moves to box 5 → next review in 16 days', () => {
  const result = computeNextReview(4, true, TODAY);
  expect(result.next_review).toBe(addDays(TODAY, 16)); // now in box 5, interval = 16
});

test('box 5 correct → next review in 16 days', () => {
  const result = computeNextReview(5, true, TODAY);
  expect(result.next_review).toBe(addDays(TODAY, 16));
});

// ── Wrong answer ──────────────────────────────────────────────────
console.log('\n❌ Wrong answer — reset behaviour:');

test('wrong from box 1 → back to section 1', () => {
  const result = computeNextReview(1, false, TODAY);
  expect(result.section).toBe(1);
});

test('wrong from box 2 → back to section 1', () => {
  const result = computeNextReview(2, false, TODAY);
  expect(result.section).toBe(1);
});

test('wrong from box 4 → back to section 1', () => {
  const result = computeNextReview(4, false, TODAY);
  expect(result.section).toBe(1);
});

test('wrong answer → due tomorrow (not today)', () => {
  const result = computeNextReview(2, false, TODAY);
  expect(result.next_review).toBe(TOMORROW);
});

test('wrong answer → not due today', () => {
  const word = computeNextReview(2, false, TODAY);
  expect(isDue(word, TODAY)).toBe(false);
});

test('wrong answer → due tomorrow', () => {
  const word = computeNextReview(2, false, TODAY);
  expect(isDue(word, TOMORROW)).toBe(true);
});

// ── isDue tests ───────────────────────────────────────────────────
console.log('\n📅 isDue logic:');

test('word with past next_review → due', () => {
  expect(isDue({ next_review: '2026-06-01', done: false }, TODAY)).toBe(true);
});

test('word with today next_review → due', () => {
  expect(isDue({ next_review: TODAY, done: false }, TODAY)).toBe(true);
});

test('word with future next_review → not due', () => {
  expect(isDue({ next_review: '2026-06-20', done: false }, TODAY)).toBe(false);
});

test('done word → never due', () => {
  expect(isDue({ next_review: TODAY, done: true }, TODAY)).toBe(false);
});

// ── Full journey test ─────────────────────────────────────────────
console.log('\n🗺  Full word journey (box 1 → box 5):');

test('word travels box 1→2→3→4→5 with correct answers', () => {
  let word = { section: 1, next_review: TODAY, done: false };
  const journey = [];

  for (let i = 0; i < 4; i++) {
    const update = computeNextReview(word.section, true, TODAY);
    Object.assign(word, update);
    journey.push(getBoxNum(word.section));
  }

  expect(journey).toEqual([2, 3, 4, 5]);
});

test('wrong answer mid-journey resets to box 1', () => {
  let word = { section: 3, next_review: TODAY, done: false };
  const update = computeNextReview(word.section, false, TODAY);
  Object.assign(word, update);
  expect(getBoxNum(word.section)).toBe(1);
});

// ── Summary ───────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
