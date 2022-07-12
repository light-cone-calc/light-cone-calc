import { expect } from 'chai';

import { Calculate } from '../legacy.js';

const getLegacyInputs = () => {
  const H_0 = 67.74;
  const OmegaL = 0.691;
  const z_upper = 1090;
  const z_lower = -0.99;
  const steps = 10;
  const Omega = 1;
  const s_eq = 3370;
  const Ynow = 978 / H_0;

  return {
    s_eq,
    Ynow,
    Yinf: Ynow / Math.sqrt(OmegaL),
    s_upper: z_upper + 1,
    s_lower: z_lower + 1,
    s_step: steps,
    exponential: true,
    Omega,
  };
};

/**
 * v.1.8.1 was calculating these results for z = 0!
 * Dnow: 3.552713678800501e-15
 * Dthen: 3.552713678800501e-15
 * Vnow: 2.460744627831758e-16
 * vThen: 2.4607446278317573e-16
 */
describe('Fix to omegaM0 calculation in v1.8.2', function () {
  it('Dnow, Dthen, v and vThen should all be 0 for z = 0', function () {
    const currentResults = Calculate(getLegacyInputs());

    let found = false;
    currentResults.forEach((current) => {
      if (current.z !== 0) return;
      found = true;
      expect(current.z).to.equal(0);
      expect(current.d).to.equal(0);
      expect(current.dEmit).to.equal(0);
      expect(current.vNow).to.equal(0);
      expect(current.vThen).to.equal(0);
    });
    expect(found).to.be.true;
  });
});
