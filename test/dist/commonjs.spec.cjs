const { expect } = require('chai');
const { readFileSync } = require('fs');

const api = require('./api.cjs');

const { version } = require('../../dist/index.cjs');
const moduleApi = require('../../dist/index.cjs');

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

describe('The Common JS module distribution', function () {
  it('should be defined in package.json `main` for old node', function () {
    expect(pkg.main).to.equal('dist/index.cjs');
  });

  it('should be defined in package.json `exports.require` for node', function () {
    expect(pkg.exports.require).to.equal('./dist/index.cjs');
  });

  it('should expose the new and legacy APIs', function () {
    expect(Object.keys(moduleApi).sort()).to.eql(api.sort());
  });

  it('should have the same version as package.json', function () {
    expect(version).to.equal(pkg.version);
  });
});
