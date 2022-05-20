/**
 * Calculate expansion results.
 */

import { getStretchValues } from './stretch-range';

export type ExpansionInputs = {
  stretch: [upper: number, lower: number] | number[];
  steps?: number;
};

type SanitizedExpansionInputs = {
  stretch: [upper: number, lower: number] | number[];
  steps?: number;
};

type IntegrationResult = {
  state: string;
  s: number;
  integralTH: number;
  integralTHs: number;
  stepCount: number;
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
  stepCount: number;
};

const physicalConstants = {
  rhoConst: 1.7885e9, // 3 / (8 pi G)
  secInGy: 3.1536e16, // s / Gyr
  tempNow: 2.725, // CMB temperature now
  Hconv: 1 / 978, // Convert km/s/Mpc -> Gyr^-1
};

const planckModel = {
  H0: 67.74, // H0 control
  OmegaL: 0.691, // OmegaL control
  Omega: 1, // Omega control
  s_eq: 1 + 3370, // Stretch when OmegaM=OmegaR
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
  return inputs;
};

const getDensityFunctionCalculator = () => {
  // Constants derived from inputs
  const { H0, Hconv, Omega, OmegaL, rhoConst, secInGy, s_eq } = {
    ...planckModel,
    ...physicalConstants,
  };
  const H0conv = H0 * Hconv; // H0 in Gyr^-1
  const rhocritNow = rhoConst * (H0conv / secInGy) ** 2; // Critical density now
  const OmegaM = ((Omega - OmegaL) * s_eq) / (s_eq + 1); // Energy density of matter
  const OmegaR = OmegaM / s_eq; // Energy density of radiation
  const OmegaK = 1 - OmegaM - OmegaR - OmegaL; // Curvature energy density

  return (s: number): number => {
    const s2 = s * s;
    // Calculate the reciprocal of the time-dependent density.
    const H =
      H0conv *
      Math.sqrt(OmegaL + OmegaK * s2 + OmegaM * s2 * s + OmegaR * s2 * s2);
    return 1 / H;
  };
};

/**
 * Get a list of cosmic expansion results for a range of stretch values.
 *
 * @param redshiftValues
 * @param inputs
 * @returns
 */
const calculateExpansionForStretchValues = (
  stretchValues: number[],
  inputs: ExpansionInputs
): IntegrationResult[] => {
  const results: IntegrationResult[] = [];

  const getDensity = getDensityFunctionCalculator();

  let resultsS1: IntegrationResult;

  // Start at s = 0.
  let s = 0;
  let integralTH = 0;
  let integralTHs = 0;
  let deltaS = 0.000001;
  let stepCount = 0;

  // Calculate density values at midpoint (use rectangle rule for first step to
  // avoid dicontinuity at s = 0).
  const TH = getDensity(s + deltaS / 2);
  const THs = TH / (s + deltaS / 2);

  s += deltaS;
  integralTH += deltaS * TH;
  integralTHs += deltaS * THs;
  ++stepCount;

  // Integrate up through the values (which are in descending order).
  let lastTH = getDensity(s);
  let lastTHs = lastTH / s;
  let state = 'BELOW_ONE';
  let stretchValuesIndex = stretchValues.length - 1;
  let nextValue = 0;
  while (state !== 'DONE') {
    if (stretchValuesIndex >= 0) {
      nextValue = stretchValues[stretchValuesIndex];
      if (state === 'ABOVE_ONE') {
        --stretchValuesIndex;
      } else if (state === 'BELOW_ONE') {
        if (nextValue > 1) {
          state = 'ABOVE_ONE';
          nextValue = 1;
        } else if (nextValue === 1) {
          state = 'ABOVE_ONE';
          --stretchValuesIndex;
        } else {
          --stretchValuesIndex;
        }
      }
    } else {
      if (nextValue < 1) {
        nextValue = 1;
      } else {
        state = 'DONE';
      }
    }

    while (s < nextValue) {
      // Calculate step length avoiding overshoot.
      deltaS = Math.min(deltaS * 1.0001, nextValue - s);

      // Trapezium rule step
      const nextTH = getDensity(s + deltaS);
      const nextTHs = lastTH / (s + deltaS);
      s += deltaS;
      integralTH += deltaS * ((lastTH + nextTH) / 2);
      integralTHs += deltaS * ((lastTHs + nextTHs) / 2);
      lastTH = nextTH;
      lastTHs = nextTHs;
      ++stepCount;
    }

    if (s === 1) {
      resultsS1 = {
        state,
        s,
        stepCount,
        integralTH,
        integralTHs,
      };
    }

    results.unshift({
      state,
      s,
      stepCount,
      integralTH,
      integralTHs,
    });
  }
  results.forEach((result) => {
    result.integralTH = result.integralTH - resultsS1.integralTH;
    result.integralTHs = result.integralTHs - resultsS1.integralTHs;
  });
  return results;
};

/**
 * Get a list of cosmic expansion results.
 *
 * @param inputs Inputs.
 * @returns
 */
const calculateExpansion = (inputs: ExpansionInputs): IntegrationResult[] => {
  // Sanitize the inputs to avoid complications later.
  const sanitized = getSanitizedInputs(inputs);

  const stretchValues = getStretchValues(sanitized);

  const results = calculateExpansionForStretchValues(stretchValues, sanitized);

  return results;
};

const convertResultUnits = () => ({});

export { calculateExpansion, convertResultUnits };
