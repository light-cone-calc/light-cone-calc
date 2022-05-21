// Legacy interface
import type { ExpansionInputs } from './expansion';

import { calculateExpansion, convertResultUnits } from './expansion';

type LegacyExpansionInputs = {
  Ynow?: number;
  Yinf?: number;
  s_eq?: number;
  Omega?: number;
  s_lower?: number;
  s_upper?: number;
  s_step?: number;
  exponential?: boolean | 0 | 1;
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
  return {
    // Ynow: inputs.Ynow ?? 0,
    // Yinf: inputs.Yinf ?? 0,
    // s_eq: inputs.s_eq ?? 0,
    // Omega: inputs.Omega ?? 0,
    stretch: [inputs.s_upper ?? 0, inputs.s_lower ?? 0],
    steps: inputs.s_step ?? 0,
    // exponential: inputs.exponential ? true : false,
  };
};

export const Calculate = (inputs: LegacyExpansionInputs) =>
  calculateExpansion(convertLegacyInputs(inputs));
export const CalculateTage = calculateExpansion;
export const ScaleResults = convertResultUnits;
