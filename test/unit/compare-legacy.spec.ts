import { expect } from 'chai';

import { convertLegacyInputs, CalculateTage } from '../legacy.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as legacy from '../legacy-calculation.js';

import { calculateExpansion } from '../../src/expansion.js';

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

const stretch = [
  1091, 340.0326542332193, 105.97819060026404, 33.030289129827494,
  10.2945709284197, 3.2085153776193285, 1.0000000000000002, 0.31167062716152094,
  0.13190823405286548, 0.055827468791045984, 0.02362783713991741,
  0.010000000000000012,
];

describe('Performance vs legacy calculations', function () {
  it('should calculate Tage for the default inputs', function () {
    const legacyTage = legacy.CalculateTage(getLegacyInputs());
    const age = CalculateTage(getLegacyInputs());
    expect(age / legacyTage).to.be.closeTo(1, 1e-3);
  });

  it('should calculate expansion for the default inputs', function () {
    const legacyResults = legacy.Calculate(getLegacyInputs());

    const inputs = convertLegacyInputs(getLegacyInputs());
    delete inputs.steps;

    const results = calculateExpansion({
      ...inputs,
      stretch,
    });
    //   console.log(results[7], legacyResults[7]);

    const eps = Number.EPSILON;
    for (let i = 0; i < legacyResults.length; ++i) {
      const r = results[i];
      const leg = legacyResults[i];
      expect(r.s / leg.s).to.be.closeTo(1, eps, `s: ${i}`);
      expect(r.a / leg.a).to.be.closeTo(1, eps, `a: ${i}`);

      // Within 0.1% is OK.
      expect(r.omegaM / leg.OmegaMatterT).to.be.closeTo(1, 0.1 / 100);
      expect(r.omegaLambda / leg.OmegaLambdaT).to.be.closeTo(1, 0.1 / 100);
      expect(r.omegaRad / leg.OmegaRadiationT).to.be.closeTo(1, 0.1 / 100);
      expect(r.temperature / leg.TemperatureT).to.be.closeTo(1, 0.1 / 100);
      expect(r.t / leg.Tnow).to.be.closeTo(1, 0.1 / 100);

      if (i === 6) {
        expect(r.z).to.be.closeTo(leg.z, eps, `z: ${i}`);
        expect(r.Vnow).to.be.closeTo(leg.Vnow, 1e-12, `Vnow: ${i}`);
        expect(r.d).to.be.closeTo(leg.Dnow, 1e-12);
        expect(r.dEmit).to.be.closeTo(leg.Dthen, 1e-12);
        continue;
      }

      expect(r.z / (leg.z + 0.001)).to.be.closeTo(1, Number.EPSILON, `z: ${i}`);
      expect(r.Vnow / leg.Vnow).to.be.closeTo(1, 0.2 / 100, `Vnow: ${i}`);
      expect(r.d / leg.Dnow).to.be.closeTo(1, 0.2 / 100, `d: ${i}`);
      expect(r.dEmit / leg.Dthen).to.be.closeTo(1, 0.2 / 100, `dEmit: ${i}`);

      // expect(r.Vnow / leg.Vthen).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.Y).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.Dhor).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.XDpar).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.Dpar).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.H_t).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.rhocrit).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
      // expect(r.Vnow / leg.OmegaTotalT).to.be.closeTo(1, 1e-5, `Vnow: ${i}`);
    }
  });
});
