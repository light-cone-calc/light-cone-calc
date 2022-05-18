
import { expect } from 'chai';

import { readFileSync } from 'fs';

// Enter the module name created by the IIFE here.
const moduleName = 'LightConeCalc';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const iife = readFileSync(pkg.browser, 'utf8');

const { version } = eval(`(() => {${iife}; return ${moduleName}})()`);

describe('The browser distribution', function () {
  it('should have the same version as package.json', function () {
    expect(version).to.equal(pkg.version);
  });
});
