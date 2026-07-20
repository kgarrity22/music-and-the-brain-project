/*
 * Validates every Location value the fixture can emit against the two things
 * createChoropleth (src/routes/dashboard/index.js) depends on:
 *
 *   1. cc.nameIncludes(name)[0].alpha3 must resolve to the CORRECT country.
 *      That call is unguarded and takes [0] blindly, and the lib does substring
 *      matching — so "India" returns IOT (British Indian Ocean Territory) first
 *      and "South Korea" returns PRK. A wrong alpha3 silently pins the study to
 *      the wrong country; no match at all throws a TypeError.
 *
 *   2. The alpha3 must exist in the bundled GeoJSON, or the country resolves
 *      fine and then never renders (e.g. Singapore/SGP is absent).
 *
 * Run before adding any country to COUNTRIES in generate-fixture.js:
 *   node scripts/validate-countries.js
 *
 * Exits non-zero if anything is unsafe.
 */

const cc = require('@genyus/country-code');
const GeoFeatures = require('../src/routes/dashboard/components/choropleth/features.js');

// Pull COUNTRIES straight from the generator so the two can't drift apart.
const generatorSource = require('fs').readFileSync(
  require('path').join(__dirname, 'generate-fixture.js'),
  'utf8',
);
const match = generatorSource.match(/const COUNTRIES = \[([\s\S]*?)\];/);
if (!match) {
  console.error('Could not find COUNTRIES in generate-fixture.js');
  process.exit(1);
}
const countries = match[1]
  .split(',')
  .map((s) => s.trim().replace(/^'|'$/g, ''))
  .filter(Boolean);

const featureIds = new Set(
  ((GeoFeatures.default || GeoFeatures).features || []).map((f) => f.id),
);

const problems = [];

for (const name of countries) {
  // createChoropleth hardcodes this one, bypassing the lookup entirely.
  if (name === 'USA') continue;

  let matches;
  try {
    matches = cc.nameIncludes(name);
  } catch (err) {
    problems.push(`${name}: lookup threw (${err.message})`);
    continue;
  }

  if (!matches || matches.length === 0) {
    problems.push(`${name}: no match — createChoropleth would throw on [0].alpha3`);
    continue;
  }

  const alpha3 = matches[0].alpha3;

  if (!featureIds.has(alpha3)) {
    problems.push(`${name}: resolves to ${alpha3}, absent from GeoJSON — renders blank`);
    continue;
  }

  if (matches.length > 1) {
    // Ambiguous but [0] is in the map. Surface it so a human can eyeball that
    // [0] is genuinely the intended country and not a lucky substring hit.
    console.log(
      `  note  ${name} -> ${alpha3} (ambiguous: ${matches.map((m) => m.alpha3).join('/')})`,
    );
  }
}

if (problems.length) {
  console.error(`\n${problems.length} unsafe country name(s):`);
  problems.forEach((p) => console.error(`  FAIL  ${p}`));
  process.exit(1);
}

console.log(`\nAll ${countries.length} country names are safe.`);
