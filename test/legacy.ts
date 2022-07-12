// cosmic-expansion/src/legacy.ts

// Provide light-cone-calc legacy interface.

import { create } from '../src/model.js';
import type { ExpansionInputs } from '../src/model.js';
import type { CosmicExpansionModelOptions } from '../src/model.js';

type LegacyExpansionInputs = {
  Ynow: number;
  Yinf: number;
  s_eq: number;
  Omega: number;
  s_lower: number;
  s_upper: number;
  s_step: number;
  exponential: boolean | 0 | 1;
};

export const xlegacyConstants = {
  gyrToSeconds: 3.1536e16,
};

/**
 * Sanitize raw inputs to `getExpansionResults()`.
 *
 * @param inputs Raw inputs.
 * @returns Sanitized inputs.
 */
export const convertLegacyInputs = (
  inputs: LegacyExpansionInputs
): [CosmicExpansionModelOptions, ExpansionInputs] => {
  const { Ynow, s_eq, Omega, s_lower, s_upper, s_step, exponential } = inputs;

  const Yinf = Math.max(Ynow, inputs.Yinf);
  const OmegaL = (Ynow / Yinf) * (Ynow / Yinf); // Lambda density parameter
  const H0GYr = 1 / Ynow; // Hubble const now
  const modelOptions = {
    // Ynow,
    // Yinf,
    zeq: s_eq - 1,
    omega0: Omega,
    omegaLambda0: OmegaL,
    // The legacy code passes Ynow = 978 / H_0.
    h0: H0GYr * 978,
  };
  const expansionInputs = {
    stretch: [s_upper, s_lower],
    steps: s_step,
    exponentialSteps: exponential ? true : false,
  };
  return [modelOptions, expansionInputs];
};

export const Calculate = (inputs: LegacyExpansionInputs) => {
  const [modelOptions, expansionInputs] = convertLegacyInputs(inputs);
  return create(modelOptions).calculateExpansion(expansionInputs);
};

// This uses a bit of a hack to calculate the current age of the universe:
// the integration only needs to be done from s = 1 to infinity so s = 2 is
// redundant.
export const CalculateTage = (inputs: LegacyExpansionInputs) => {
  const [modelOptions] = convertLegacyInputs(inputs);
  return create(modelOptions).age;
};

// export const ScaleResults = convertResultUnits;
