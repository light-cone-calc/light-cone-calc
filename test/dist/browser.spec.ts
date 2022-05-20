import { expect } from 'chai';

import { readFileSync } from 'fs';

// Enter the module name created by the IIFE here.
const moduleName = 'LightConeCalc';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const iife = readFileSync(pkg.browser, 'utf8');

const LightConeCalc = eval(`(() => {${iife}; return ${moduleName}})()`);

describe('The browser distribution', function () {
  it('should have the same version as package.json', function () {
    expect(LightConeCalc.version).to.equal(pkg.version);
  });

  it('should expose the new and legacy APIs', function () {
    const api = ['getStretchValues', 'version'];
    const legacyApi = ['Calculate', 'CalculateTage', 'ScaleResults'];
    expect(Object.keys(LightConeCalc).sort()).to.eql(
      [...api, ...legacyApi].sort()
    );
  });
});
