import { expect } from 'chai';
import { Calculate } from '../legacy-calculation.js';

import { calculateExpansion } from '../../src/expansion';

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

describe('Expansion calculations', function () {
  it('should calculate expansion for the default inputs', function () {
    const legacyResults = Calculate(getLegacyInputs());

    const results = calculateExpansion({
      stretch,
    });

    console.log(legacyResults[0]);
    console.log(results[0]);
  });
});
