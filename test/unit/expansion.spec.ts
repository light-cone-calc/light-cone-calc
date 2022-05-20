import { expect } from 'chai';

import { calculateExpansion } from '../../src/expansion';

describe('Expansion calculations', function () {
  it('should calculate expansion for the default inputs', function () {
    const results = calculateExpansion({
      stretch: [1091, 0.01],
      steps: 10,
    });

    // console.log(results);
    // expect(results[0]).to.eql({ s: 0, stepCount: 1 });
    // expect(results[11]).to.eql({ s: 0, stepCount: 1 });
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

    console.log(results);
    // expect(results[0]).to.eql({ s: 0, stepCount: 1 });
    // expect(results[11]).to.eql({ s: 0, stepCount: 1 });
  });
});
