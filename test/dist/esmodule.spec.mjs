import { expect } from 'chai';
import { readFileSync } from 'fs';

import api from './api.cjs';

import { version } from '../../dist/index.js';
import * as moduleApi from '../../dist/index.js';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

describe('The ES module distribution', function () {
  it('should be defined in package.json `module` for bundlers', function () {
    expect(pkg.module).to.equal('dist/index.js');
  });

  it('should be defined in package.json `exports.import` for node', function () {
    expect(pkg.exports.import).to.equal('./dist/index.js');
  });

  it('should expose the correct API', function () {
    expect(Object.keys(moduleApi).sort()).to.eql(api.sort());
  });

  it('should have the same version as package.json', function () {
    expect(version).to.equal(pkg.version);
  });
});
