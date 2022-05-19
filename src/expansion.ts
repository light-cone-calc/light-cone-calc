/**
 * Calculate expansion results.
 */

type ExpansionInputs = {
  Ynow?: number;
  Yinf?: number;
  s_eq?: number;
  Omega?: number;
  s_lower?: number;
  s_upper?: number;
  s_step?: number;
  exponential?: boolean | 0 | 1;
};

type SanitizedExpansionInputs = {
  Ynow: number;
  Yinf: number;
  s_eq: number;
  Omega: number;
  s_lower: number;
  s_upper: number;
  s_step: number;
  exponential: boolean;
};

type ExpansionResult = {
  s: number;
  a: number;
  z: number;
  Vnow: number;
  Vthen: number;
  Tnow: number;
  Y: number;
  Dnow: number;
  Dthen: number;
  Dhor: number;
  XDpar: number;
  Dpar: number;
  H_t: number;
  OmegaMatterT: number;
  OmegaLambdaT: number;
  OmegaRadiationT: number;
  TemperatureT: number;
  rhocrit: number;
  OmegaTotalT: number;
};

/**
 * Sanitize raw inputs to `getExpansionResults()`.
 *
 * @param inputs Raw inputs.
 * @returns Sanitized inputs.
 */
const getSanitizedInputs = (
  inputs: ExpansionInputs
): SanitizedExpansionInputs => {
  return {
    Ynow: inputs.Ynow ?? 0,
    Yinf: inputs.Yinf ?? 0,
    s_eq: inputs.s_eq ?? 0,
    Omega: inputs.Omega ?? 0,
    s_lower: inputs.s_lower ?? 0,
    s_upper: inputs.s_upper ?? 0,
    s_step: inputs.s_step ?? 0,
    exponential: inputs.exponential ? true : false,
  };
};

/**
 * Get a list of cosmic expansion results for a range of stretch values.
 *
 * @param redshiftValues
 * @param inputs
 * @returns
 */
const getExpansionForStretchValues = (
  stretchValues: number[],
  inputs: ExpansionInputs
): ExpansionResult[] => {
  const results: ExpansionResult[] = [];

  return results;
};

/**
 * Get a list of cosmic expansion results.
 *
 * @param inputs Inputs.
 * @returns
 */
const getExpansionResults = (inputs: ExpansionInputs): ExpansionResult[] => {
  const sanitized = getSanitizedInputs(inputs);

  const { s_upper, s_lower, s_step } = sanitized;
  const stretchValues = getStretchValues(s_upper, s_lower, s_step);

  const results = getExpansionForStretchValues(stretchValues, sanitized);

  return results;
};

const addStretchValues = (
  steps: number[],
  upper: number,
  lower: number,
  count: number
) => {
  const factor = (lower / upper) ** (1 / count);
  let current = upper;
  for (let i = 0; i < count - 1; ++i) {
    current *= factor;
    steps.push(current);
  }
  steps.push(lower);

  return steps;
};

/**
 * Get a list of output values for stretch factor s (i.e. 1 + redshift (z)).
 *
 * @todo Implement linear steps (currently only exponential).
 * @todo Deal with negative step values.
 * @param inputs Sanitized inputs.
 * @returns Sanitized inputs.
 */
const getStretchValues = (
  upper: number,
  lower: number,
  count: number
): number[] => {
  const steps = [upper];
  if (lower > 1 || upper < 1) {
    // Even steps all the way down.
    addStretchValues(steps, upper, lower, count);
    return steps;
  }

  const factor = (lower / upper) ** (1 / count);
  const countLower = Math.ceil(Math.log(lower) / Math.log(factor));
  // From upper down to 1.
  addStretchValues(steps, upper, 1, count - countLower);
  // From 1 down to lower.
  addStretchValues(steps, 1, lower, countLower);
  return steps;
};

export { getExpansionForStretchValues, getExpansionResults, getStretchValues };
