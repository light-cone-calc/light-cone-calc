// Legacy interface
import type { ExpansionInputs } from './expansion';

import { calculateExpansion, convertResultUnits } from './expansion';

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

/**
 * Sanitize raw inputs to `getExpansionResults()`.
 *
 * @param inputs Raw inputs.
 * @returns Sanitized inputs.
 */
const convertLegacyInputs = (
  inputs: LegacyExpansionInputs
): ExpansionInputs => {
  const { Ynow, s_eq, Omega, s_lower, s_upper, s_step, exponential } = inputs;

  const Yinf = Math.max(Ynow, inputs.Yinf);
  const OmegaL = (Ynow / Yinf) * (Ynow / Yinf); // Lambda density parameter
  const H0GYr = 1 / Ynow; // Hubble const now

  return {
    Ynow,
    Yinf,
    s_eq,
    Omega,
    OmegaL,
    H0GYr,
    stretch: [s_upper, s_lower],
    steps: s_step,
    exponential: exponential ? true : false,
  };
};

export const Calculate = (inputs: LegacyExpansionInputs) => {
  const converted = convertLegacyInputs(inputs);
  return calculateExpansion(converted);
};

export const CalculateTage = (inputs: LegacyExpansionInputs) => {
  return 0;
  const converted = convertLegacyInputs(inputs);
  return calculateExpansion(converted);
};

export const ScaleResults = convertResultUnits;
