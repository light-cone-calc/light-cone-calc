import { expect } from 'chai';
import { Calculate } from '../../src/calculation.js';

const getInputs = () => {
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

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip('Calculation', function () {
  it('should have the legacy 0.001 offset in z', function () {
    const results = Calculate(getInputs());
    expect(results[0].s).to.equal(1091);
    expect(results[0].z).not.to.equal(1090);
    expect(results[0].z).to.equal(1089.999);
  });

  it('should reproduce the legacy results', function () {
    const results = Calculate(getInputs());

    expect(results.length).to.equal(12);

    // Truncation errors in s, a and z.
    expect(results[6]).to.eql({
      s: 1.0000000000000002,
      a: 0.9999999999999998,
      z: 2.220446049250313e-16,
      Vnow: 0,
      Vthen: 0,
      Tnow: 13.799912133430405,
      Y: 14.437553112687313,
      Dnow: 0,
      Dthen: 0,
      Dhor: 14.437553112687313,
      XDpar: 1.0000001555691052,
      Dpar: 46.28412845250439,
      H_t: 0.06926381445628957,
      OmegaMatterT: 0.30899990385831544,
      OmegaLambdaT: 0.6909997850035464,
      OmegaRadiationT: 0.00009169136613006393,
      TemperatureT: 2.7250000000000005,
      rhocrit: 8.627570976303761e-27,
      OmegaTotalT: 1.0000913802279918,
    });

    // Inaccurate results.
    expect(results[11]).to.eql({
      s: 0.010000000000000012,
      a: 99.99999999999987,
      z: -0.991,
      Vnow: 1.1350483617944434,
      Vthen: 94.35259192890884,
      Tnow: 92.66416362486491,
      Y: 17.368175291447308,
      Dnow: 16.387323558236872,
      Dthen: 1638.732355823685,
      Dhor: 17.368175291447308,
      XDpar: 83.12649496250808,
      Dpar: 6265.640440919289,
      H_t: 0.05757657227771271,
      OmegaMatterT: 4.471770862297439e-7,
      OmegaLambdaT: 0.9999979501124658,
      OmegaRadiationT: 1.3269349739755028e-12,
      TemperatureT: 0.027250000000000035,
      rhocrit: 5.9616619104651685e-27,
      OmegaTotalT: 0.999998397290879,
    });
  });
});
