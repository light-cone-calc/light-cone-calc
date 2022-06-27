import { expect } from 'chai';
import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import api from './api.cjs';

// Enter the module name created by the IIFE here.
const moduleName = 'CosmicInflation';
const fileName = 'dist/cosmic-inflation.min.js';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const iife = readFileSync(fileName, 'utf8');

const CosmicInflation = eval(`(() => {${iife}; return ${moduleName}})()`);

describe('The browser distribution', function () {
  it('should be defined in package.json `browser`', function () {
    expect(pkg.browser).to.equal(fileName);
  });

  it('should have the same version as package.json', function () {
    expect(CosmicInflation.version).to.equal(pkg.version);
  });

  it('should expose the new and legacy APIs', function () {
    expect(Object.keys(CosmicInflation).sort()).to.eql(api.sort());
  });
});
