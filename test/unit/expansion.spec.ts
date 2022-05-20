import { expect } from 'chai';

import { calculateExpansion } from '../../src/expansion';

describe('Expansion calculations', function () {
  it('should calculate expansion for the default inputs', function () {
    const results = calculateExpansion({
      stretch: [1091, 0.01],
      steps: 10,
    });

    // This validates the integration of THs to infinity.
    // (13.8Gy since big bang).
    expect(results[6].s).to.equal(1);
    expect(results[6].Tnow / 13.8).to.be.closeTo(1, 1e-5);

    const result = results[0];
    expect(result.z).to.equal(1090);
    expect(result.a).to.equal(1 / 1091);
    expect(result.s).to.equal(1091);
    // expect(result.Tnow).to.equal(3.719732675590e-04);
    expect(result.Dnow / 45.35442113146).to.be.closeTo(1, 1e-6);
    expect(result.Dthen / 4.157145985602e-2).to.be.closeTo(1, 1e-6);
    expect(result.Dhor / 5.673735574007e-2).to.be.closeTo(1, 1e-6);
    expect(result.Tnow / 3.71973267559e-4).to.be.closeTo(1, 1e-3);

    /*
    R Gly,Dpar Gly,Vgen/c,Vnow/c,Vthen/c,H(z),Temp (K),rho kg/m3,OmegaM,OmegaL,OmegaR,OmegaT
    6.265517428441e-04,8.384887831152e-04,2.112089743468e+01,3.141419721314e+00,6.634960373315e+01,1.560924554388e+06,2.972972275000e+03,4.581016392767e-18,7.557150944256e-01,1.301381435600e-09,2.445815521516e-01,1.000296647879e+00
    */
  });

  it('should calculate expansion for values close to s = 1', function () {
    const results = calculateExpansion({
      stretch: [
        1.1, 1.09, 1.08, 1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1, 0.99,
        0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.9,
      ],
      // stretch: [1.1, 0.9],
      // steps: 20,
    });

    // expect(results[0]).to.eql({ s: 0, stepCount: 1 });
    // expect(results[11]).to.eql({ s: 0, stepCount: 1 });
  });
});
