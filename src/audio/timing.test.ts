import { normalise, locate, deriveWindows, type WordTiming } from './timing';

// Stub: "Google shipped three point eight flash today. It is faster. Here is why."
// One word per 0.4s starting at 0.
const script = "Google shipped three point eight flash today It is faster Here is why".split(' ');
const words: WordTiming[] = script.map((w, i) => ({ word: w, start: i * 0.4, end: i * 0.4 + 0.35 }));

const show = (label: string, r: unknown) => console.log(label.padEnd(34), JSON.stringify(r));

console.log('--- normalise ---');
show('"Gemini 3.8 Flash!"', normalise('Gemini 3.8 Flash!'));

console.log('\n--- locate ---');
show('exact: "It is faster"', locate('It is faster', words));
show('mismatch: "shipped 3.8 Flash"', locate('shipped 3.8 Flash', words));
show('absent: "quarterly earnings call"', locate('quarterly earnings call', words));

console.log('\n--- deriveWindows ---');
const w = deriveWindows(
  ['Google shipped three point eight flash today', 'It is faster', 'Here is why'],
  words,
);
w.forEach((x, i) => console.log(`  scene ${i}: ${x.startSec.toFixed(2)}s -> ${x.endSec.toFixed(2)}s`));

const audioEnd = words[words.length - 1].end;
console.log('\naudio ends at        ', audioEnd.toFixed(2));
console.log('last scene ends at   ', w[w.length - 1].endSec.toFixed(2));
console.log('contiguous?          ', w.every((x, i) => i === 0 || x.startSec === w[i-1].endSec));
console.log('all forward?         ', w.every((x) => x.endSec > x.startSec));
