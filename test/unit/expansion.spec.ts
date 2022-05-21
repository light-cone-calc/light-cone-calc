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

    expect(result.Dnow / 45.35442113146).to.be.closeTo(1, 1e-5);
    expect(result.Dthen / 4.157145985602e-2).to.be.closeTo(1, 1e-6);
    expect(result.Dhor / 5.673735574007e-2).to.be.closeTo(1, 1e-6);
    expect(result.Tnow / 3.71973267559e-4).to.be.closeTo(1, 1e-3);
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

    // Values taken from
    // https://www.physicsforums.com/threads/a-glitch-in-jorries-cosmo-calculator.1014779/post-6632672
    expect(results[0].Dnow / 1.41004).to.be.closeTo(1, 1e-3);
    expect(results[1].Dnow / 1.27214).to.be.closeTo(1, 1e-3);
    expect(results[2].Dnow / 1.13354).to.be.closeTo(1, 1e-3);
    expect(results[3].Dnow / 0.99426).to.be.closeTo(1, 1e-3);
    expect(results[4].Dnow / 0.85427).to.be.closeTo(1, 1e-3);
    expect(results[5].Dnow / 0.7136).to.be.closeTo(1, 1e-3);
    expect(results[6].Dnow / 0.57225).to.be.closeTo(1, 1e-3);
    expect(results[7].Dnow / 0.43023).to.be.closeTo(1, 1e-3);
    expect(results[8].Dnow / 0.28748).to.be.closeTo(1, 1e-3);
    expect(results[9].Dnow / 0.14408).to.be.closeTo(1, 1e-3);

    expect(results[20].Dnow / 1.47679).to.be.closeTo(1, 1e-3);
  });
});
