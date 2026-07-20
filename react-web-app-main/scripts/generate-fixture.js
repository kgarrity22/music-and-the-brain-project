/*
 * Generates the static demo fixture that replaces the (now dead) Airtable feed.
 *
 * Airtable deprecated the API key this app shipped with, so the live fetch 401s
 * and every spinner on the dashboard hangs forever. This produces a plausible
 * stand-in corpus with the same field names and value shapes the dashboard
 * already expects.
 *
 * Run manually — this is NOT wired into the build:
 *   node scripts/generate-fixture.js
 *
 * Output: src/data/studies.fixture.json (committed, so charts are identical on
 * every reload). The PRNG is seeded, so re-running reproduces byte-identical
 * output instead of churning the diff.
 */

const fs = require('fs');
const path = require('path');

const RECORD_COUNT = 349; // corpus size reported in the source paper
const SEED = 20260720;

// mulberry32 — small seeded PRNG, keeps regeneration deterministic
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(SEED);

const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const intBetween = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

// Picks 1..max distinct values and comma-joins them.
//
// The dashboard handles both arrays and comma-delimited strings (createPieChart
// branches on typeof value === "object"), but we emit ONLY strings so every
// consumer takes one consistent path.
//
// Joined with "," and NO trailing space, deliberately. There are 8 sites in
// dashboard/index.js that do split(",") without trimming, so ", " would make
// " Bipolar Disorder" a different key from "Bipolar Disorder" — every
// multi-value field would then show duplicate legend entries, duplicate bars,
// and duplicate filter checkboxes.
function pickMulti(arr, max) {
  const n = 1 + Math.floor(rng() * max);
  const out = [];
  while (out.length < n && out.length < arr.length) {
    const v = pick(arr);
    if (!out.includes(v)) out.push(v);
  }
  return out.join(',');
}

// Weighted pick: entries are [value, weight]. Keeps charts from looking uniform.
function pickWeighted(pairs) {
  const total = pairs.reduce((sum, p) => sum + p[1], 0);
  let r = rng() * total;
  for (const [value, weight] of pairs) {
    r -= weight;
    if (r <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
}

////////////////////////////////////////////////////////////////////////////////
//  VOCABULARIES
////////////////////////////////////////////////////////////////////////////////

// Kept in sync with SECONDARY_DESIGNS in src/routes/dashboard/index.js — the
// stat tiles split primary vs. secondary studies on exactly these strings.
const SECONDARY_DESIGNS = [
  'Systematic Review',
  'Meta-Analysis',
  'Scoping Review',
  'Narrative Review',
];

const PRIMARY_DESIGNS = [
  'Randomized Controlled Trial',
  'Quasi-Experimental',
  'Cohort Study',
  'Cross-Sectional',
  'Case Study',
  'Case Series',
  'Qualitative',
  'Mixed Methods',
  'Pilot Study',
];

const DESIGN_WEIGHTED = [
  ['Randomized Controlled Trial', 26],
  ['Quasi-Experimental', 14],
  ['Qualitative', 12],
  ['Cohort Study', 9],
  ['Mixed Methods', 8],
  ['Cross-Sectional', 7],
  ['Pilot Study', 7],
  ['Case Study', 6],
  ['Case Series', 4],
  ['Systematic Review', 7],
  ['Narrative Review', 4],
  ['Meta-Analysis', 3],
  ['Scoping Review', 2],
];

const CONDITIONS = [
  'Schizophrenia',
  'Bipolar Disorder',
  'Major Depressive Disorder',
  'Schizoaffective Disorder',
  'Psychosis',
  'Post-Traumatic Stress Disorder',
  'Borderline Personality Disorder',
  'Severe Anxiety Disorder',
];

const INTERVENTION_TYPES = [
  'Music Therapy',
  'Music Medicine',
  'Community Music',
  'Recreational Music',
];

const INTERVENTIONS = [
  'Group Music Therapy',
  'Individual Music Therapy',
  'Guided Imagery and Music',
  'Nordoff-Robbins Music Therapy',
  'Vocal Psychotherapy',
  'Drum Circle',
  'Songwriting Program',
  'Music-Assisted Relaxation',
  'Choir Participation',
  'Music Listening Program',
];

const ACTIVITY_TYPES = [
  'Listening',
  'Singing',
  'Playing Instruments',
  'Improvisation',
  'Songwriting',
  'Movement/Dance',
  'Composition',
];

// Weighted — picking these uniformly produced a near-flat bar chart. Real
// trials lean heavily on treatment-as-usual and waitlist controls.
const COMPARATORS_WEIGHTED = [
  ['Treatment as Usual', 34],
  ['Waitlist Control', 20],
  ['Standard Care', 15],
  ['Active Control', 12],
  ['No Intervention', 11],
  ['None', 8],
];

const OUTCOMES = [
  'Depression',
  'Anxiety',
  'Negative Symptoms',
  'Positive Symptoms',
  'Quality of Life',
  'Social Functioning',
  'Cognitive Function',
  'Global Functioning',
  'Self-Esteem',
  'Medication Adherence',
  'Hospital Readmission',
];

const RESULTS_WEIGHTED = [
  ['Significant Improvement', 42],
  ['Partial Improvement', 25],
  ['Mixed Results', 20],
  ['No Significant Change', 13],
];

const STUDY_POPULATIONS = [
  'Adults',
  'Adolescents',
  'Older Adults',
  'Young Adults',
  'Mixed Ages',
];

const GENDERS = ['Mixed', 'Female Only', 'Male Only', 'Not Reported'];

const RACE_ETH = [
  'Not Reported',
  'Predominantly White',
  'Predominantly Black/African American',
  'Mixed/Multiethnic',
  'Predominantly Asian',
  'Predominantly Hispanic/Latino',
];

// Every name here was validated against BOTH:
//   1. @genyus/country-code — cc.nameIncludes(name)[0].alpha3 must resolve to
//      the CORRECT country. createChoropleth takes [0] blindly, and that lib
//      does substring matching, so e.g. "India" resolves to IOT (British Indian
//      Ocean Territory) and "South Korea" to PRK. Both are excluded for that
//      reason — a wrong pin is worse than an absent one.
//   2. The bundled GeoJSON in components/choropleth/features.js — the alpha3
//      must exist there or the country silently never renders (e.g. Singapore).
//
// Re-validate with scripts/validate-countries.js before adding any name.
const COUNTRIES = [
  'USA', 'United Kingdom', 'China', 'Germany', 'Australia', 'Brazil',
  'Norway', 'Sweden', 'Denmark', 'Netherlands', 'Italy', 'Spain', 'Canada',
  'Japan', 'Turkey', 'Iran', 'Israel', 'Austria', 'Finland', 'Switzerland',
  'Belgium', 'Ireland', 'New Zealand', 'South Africa', 'Nigeria', 'Kenya',
  'Mexico', 'Argentina', 'Chile', 'Colombia', 'Poland', 'Portugal', 'Greece',
  'Thailand', 'Malaysia', 'Indonesia', 'Egypt', 'Pakistan', 'Bangladesh',
  'France', 'Ghana', 'Uganda', 'Ethiopia', 'Vietnam', 'Philippines', 'Peru',
  'Hungary', 'Romania', 'Croatia', 'Serbia', 'Estonia', 'Lithuania',
  'Czech Republic', 'Taiwan', 'Russia',
];

// Research output is concentrated in a handful of countries; without this the
// choropleth is a flat wash of identical color.
const COUNTRY_WEIGHTED = COUNTRIES.map((c) => {
  if (['USA', 'United Kingdom', 'Germany', 'Australia'].includes(c)) return [c, 10];
  if (['China', 'Norway', 'Canada', 'Brazil', 'Italy', 'Japan'].includes(c)) return [c, 6];
  if (['Sweden', 'Denmark', 'Netherlands', 'Spain', 'Finland', 'Israel'].includes(c)) return [c, 4];
  return [c, 2];
});

const SURNAMES = [
  'Aaltonen', 'Abebe', 'Almeida', 'Andersen', 'Bakker', 'Beltran', 'Bianchi',
  'Brennan', 'Castillo', 'Chen', 'Corrigan', 'Dalgaard', 'Delacroix', 'Ekwueme',
  'Faulkner', 'Fernandez', 'Fischer', 'Gallagher', 'Gustafsson', 'Haddad',
  'Halvorsen', 'Hartmann', 'Ibrahim', 'Ishikawa', 'Jankowski', 'Kaur',
  'Keller', 'Kovac', 'Laurent', 'Lindqvist', 'Mancini', 'Marchetti',
  'Mbeki', 'Mendoza', 'Nakamura', 'Nguyen', 'Nowak', 'Okafor', 'Olsen',
  'Pereira', 'Petrov', 'Quinn', 'Rasmussen', 'Reyes', 'Rossi', 'Sandoval',
  'Schneider', 'Silva', 'Sorensen', 'Tanaka', 'Thibault', 'Vargas',
  'Virtanen', 'Wagner', 'Whitfield', 'Yamamoto', 'Zieliński',
];

const INITIALS = 'ABCDEFGHIJKLMNOPRSTVW'.split('');

function makeAuthors() {
  const n = pickWeighted([[1, 3], [2, 5], [3, 4], [4, 2]]);
  const used = [];
  const parts = [];
  while (parts.length < n) {
    const surname = pick(SURNAMES);
    if (used.includes(surname)) continue;
    used.push(surname);
    parts.push(`${surname}, ${pick(INITIALS)}.`);
  }
  return parts.join('; ');
}

const TITLE_TEMPLATES = [
  (i, c, o) => `The effect of ${lower(i)} on ${lower(o)} in adults with ${lower(c)}`,
  (i, c, o) => `${i} for ${lower(c)}: impact on ${lower(o)}`,
  (i, c, o) => `Exploring ${lower(i)} as an adjunct treatment for ${lower(c)}`,
  (i, c, o) => `${i} and ${lower(o)} among individuals with ${lower(c)}`,
  (i, c, o) => `A controlled study of ${lower(i)} in ${lower(c)} care`,
  (i, c, o) => `Improving ${lower(o)} through ${lower(i)}: evidence from ${lower(c)} services`,
  (i, c, o) => `Participant experiences of ${lower(i)} in community ${lower(c)} settings`,
];

// Lowercase the WHOLE term for mid-sentence use — lowercasing only the first
// character leaves "Choir Participation" as "choir Participation". Proper nouns
// keep their casing.
function lower(term) {
  const proper = ['Nordoff', 'Guided Imagery', 'Post-Traumatic'];
  if (proper.some((p) => term.startsWith(p))) return term;
  return term.toLowerCase();
}

function makeTitle(intervention, condition, outcome) {
  return pick(TITLE_TEMPLATES)(intervention, condition, outcome);
}

////////////////////////////////////////////////////////////////////////////////
//  GENERATE
////////////////////////////////////////////////////////////////////////////////

const records = [];

for (let i = 0; i < RECORD_COUNT; i++) {
  const design = pickWeighted(DESIGN_WEIGHTED);
  const isSecondary = SECONDARY_DESIGNS.includes(design);

  const intervention = pick(INTERVENTIONS);
  const condition = pick(CONDITIONS);
  const outcome = pick(OUTCOMES);

  // Reviews pool many studies, so their sample sizes run an order of magnitude
  // larger than primary studies.
  const sampleSize = isSecondary ? intBetween(400, 4200) : intBetween(8, 320);

  // A small slice of records mirrors the real corpus's missing/aggregate
  // geography. createChoropleth special-cases both of these strings.
  const locationRoll = rng();
  let location;
  if (locationRoll < 0.04) location = 'Various';
  else if (locationRoll < 0.07) location = 'NR';
  else if (locationRoll < 0.14) {
    // Multi-site studies span two countries.
    let a = pickWeighted(COUNTRY_WEIGHTED);
    let b = pickWeighted(COUNTRY_WEIGHTED);
    while (b === a) b = pickWeighted(COUNTRY_WEIGHTED);
    // No space after the comma — the filter facet builder splits Location
    // without trimming, same as every other multi-value field.
    location = `${a},${b}`;
  } else location = pickWeighted(COUNTRY_WEIGHTED);

  records.push({
    id: i, // row index, matching what getTableData used to inject
    Authors: makeAuthors(),
    Year: String(intBetween(1995, 2020)),
    Title: makeTitle(intervention, condition, outcome),
    Location: location,
    Conditions: pickMulti(CONDITIONS, 2),
    Design: design,
    Intervention_Type: pick(INTERVENTION_TYPES),
    Study_Pop_Stnd: pick(STUDY_POPULATIONS),
    Race_Eth: pick(RACE_ETH),
    Gender: pick(GENDERS),
    Sample_Size: String(sampleSize),
    Interventions: pickMulti(INTERVENTIONS, 2),
    Activity_Type: pickMulti(ACTIVITY_TYPES, 3),
    Comparator: pickWeighted(COMPARATORS_WEIGHTED),
    Outcomes: pickMulti(OUTCOMES, 3),
    Results: pickWeighted(RESULTS_WEIGHTED),
  });
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'studies.fixture.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(records, null, 2)}\n`);

const secondary = records.filter((r) => SECONDARY_DESIGNS.includes(r.Design)).length;
console.log(`Wrote ${records.length} records to ${path.relative(process.cwd(), outPath)}`);
console.log(`  primary: ${records.length - secondary}, secondary: ${secondary}`);
console.log(`  participants: ${records.reduce((s, r) => s + parseInt(r.Sample_Size, 10), 0)}`);
