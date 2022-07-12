import { expect } from 'chai';

import { create } from '../../src/model.js';

import { convertLegacyInputs, CalculateTage } from '../legacy.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as legacy from '../legacy-calculation.js';

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete inputs.steps;

    const model = create(inputs);

    const results = model.calculateExpansion({
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
      // leg.z see below.
      // leg.Vnow see below.
      // leg.Vthen see below.
      expect(r.t / leg.Tnow).to.be.closeTo(1, 0.1 / 100);
      expect(leg.Y).to.equal(leg.Dhor);
      // leg.Dnow see below.
      // leg.Dthen see below.
      expect(r.r / leg.Dhor).to.be.closeTo(1, 0.1 / 100);
      expect(r.vGen / leg.XDpar).to.be.closeTo(1, 0.1 / 100);
      // dPar inaccurate in LightCone7 due to integration method.
      if (i < 2) {
        expect(r.dPar / leg.Dpar).to.be.closeTo(1, 2 / 100);
      } else if (i < 5) {
        expect(r.dPar / leg.Dpar).to.be.closeTo(1, 0.5 / 100);
      } else {
        expect(r.dPar / leg.Dpar).to.be.closeTo(1, 0.1 / 100);
      }
      expect(1 / r.r / leg.H_t).to.be.closeTo(1, 0.1 / 100);
      expect(r.omegaM / leg.OmegaMatterT).to.be.closeTo(1, 0.1 / 100);
      expect(r.omegaLambda / leg.OmegaLambdaT).to.be.closeTo(1, 0.1 / 100);
      expect(r.omegaRad / leg.OmegaRadiationT).to.be.closeTo(1, 0.1 / 100);
      expect(r.temperature / leg.TemperatureT).to.be.closeTo(1, 0.1 / 100);
      expect(r.rhoCrit / leg.rhocrit).to.be.closeTo(1, 0.1 / 100);
      const omegaTot = r.omegaM + r.omegaRad + r.omegaLambda;
      expect(omegaTot / leg.OmegaTotalT).to.be.closeTo(1, 0.1 / 100);

      if (i === 6) {
        expect(r.z).to.be.closeTo(leg.z, eps, `z: ${i}`);
        expect(r.vNow).to.be.closeTo(leg.Vnow, 1e-12);
        expect(r.v).to.be.closeTo(leg.Vthen, 1e-12);
        expect(r.dNow).to.be.closeTo(leg.Dnow, 1e-12);
        expect(r.d).to.be.closeTo(leg.Dthen, 1e-12);
        continue;
      }

      expect(r.z / (leg.z + 0.001)).to.be.closeTo(1, Number.EPSILON);
      expect(r.vNow / leg.Vnow).to.be.closeTo(1, 0.2 / 100);
      expect(r.v / leg.Vthen).to.be.closeTo(1, 0.2 / 100);
      expect(r.dNow / leg.Dnow).to.be.closeTo(1, 0.2 / 100);
      expect(r.d / leg.Dthen).to.be.closeTo(1, 0.2 / 100);
    }
  });
});
