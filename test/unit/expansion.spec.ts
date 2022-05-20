import { expect } from 'chai';
import { getStretchValues, calculateExpansion } from '../../src/expansion';

const steps = getStretchValues(1090 + 1, 0.01, 10);
describe('src/expansion.ts', function () {
  describe('Step calculations', function () {
    it('should calculate steps for the default inputs', function () {
      expect(steps).to.eql([
        1091, 340.0326542332193, 105.97819060026406, 33.0302891298275,
        10.294570928419706, 3.2085153776193307, 1, 0.31622776601683794, 0.1,
        0.0316227766016838, 0.01,
      ]);
    });

    it('should calculate the right number of steps', function () {
      expect(steps.length).to.equal(11);
    });

    it('should calculate redshift 0 exactly', function () {
      expect(steps[6] - 1).to.equal(0);
    });

    it('should calculate steps above 1', function () {
      const steps = getStretchValues(256, 2, 7);
      expect(steps).to.eql([256, 128, 64, 32, 16, 8, 4, 2]);
    });
  });

  describe('Expansion calculations', function () {
    it('should calculate expansion for the default inputs', function () {
      const results = calculateExpansion({
        s_upper: 1.1,
        s_lower: 0.9,
        s_step: 20,
      });

      console.log(results);
      // expect(results[0]).to.eql({ s: 0, stepCount: 1 });
      // expect(results[11]).to.eql({ s: 0, stepCount: 1 });
    });
  });
});
