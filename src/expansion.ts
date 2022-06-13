/**
 * Calculate expansion results.
 */

import { getStretchValues } from './stretch-range';
import { getModel } from './model';

export interface ExpansionInputs {
  Ynow?: number;
  Yinf?: number;
  s_eq?: number;
  Omega?: number;
  OmegaL?: number;
  H_0?: number;
  exponential?: boolean;
  stretch: [upper: number, lower: number] | number[];
  steps?: number;
}

type IntegrationResult = {
  s: number;
  sumTh0: number;
  sumThs1: number;
  stepCount: number;
  lastStep: number;
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
  // Convert stretch values in descending order into integration points in
  // ascending order, ensuring s = 1 exactly is in the list.
  const points: number[] = [];

  let isBelowOne = true;
  for (let i = stretchValues.length - 1; i >= 0; --i) {
    const value = stretchValues[i];
    if (isBelowOne) {
      if (value > 1) {
        isBelowOne = false;
        points.push(1);
      } else if (value === 1) {
        isBelowOne = false;
      }
    }
    points.push(value);
  }
  if (isBelowOne) {
    points.push(1);
  }
  points.push(Infinity);

  // Get a calculator for density using any provided overrides.
  const { TH } = getModel(inputs);

  // Create an array to build the return values.
  const results: IntegrationResult[] = [];

  // Start at s = 0.
  let s = 0;
  let sumTh0 = 0;
  let sumThs1 = 0;
  let deltaS = 0.0001;
  let stepCount = 0;

  // Integrate up, storing values at each data point.
  isBelowOne = true;
  let lastTH = TH(s);
  let lastTHs = lastTH / s;

  for (let i = 0; i < points.length; ++i) {
    const nextValue = points[i];

    if (isBelowOne) {
      while (s < nextValue) {
        // Trapezium rule step.
        // Calculate step length avoiding overshoot.
        deltaS = Math.min(deltaS * 1.001, nextValue - s);

        const nextTH = TH(s + deltaS);
        s += deltaS;
        sumTh0 += deltaS * ((lastTH + nextTH) / 2);
        lastTH = nextTH;
        ++stepCount;
      }
      if (nextValue >= 1) {
        isBelowOne = false;
        lastTHs = lastTH / s;
      }
    } else if (nextValue < Infinity) {
      while (s < nextValue) {
        // Trapezium rule step.
        // Calculate step length avoiding overshoot.
        deltaS = Math.min(deltaS * 1.001, nextValue - s);
        const nextTH = TH(s + deltaS);
        const nextTHs = nextTH / (s + deltaS);
        s += deltaS;
        sumTh0 += deltaS * ((lastTH + nextTH) / 2);
        sumThs1 += deltaS * ((lastTHs + nextTHs) / 2);
        lastTH = nextTH;
        lastTHs = nextTHs;
        ++stepCount;
      }
    } else {
      // Integrate to infinity.
      while (s < nextValue) {
        // Trapezium rule step.
        // Calculate step length avoiding overshoot.
        if (s < 4000) {
          deltaS = deltaS * 1.001;
        } else {
          deltaS = deltaS * 1.1;
        }
        const nextTH = TH(s + deltaS);
        const nextTHs = nextTH / (s + deltaS);
        if (isNaN(nextTHs)) break;
        s += deltaS;
        sumTh0 += deltaS * ((lastTH + nextTH) / 2);
        sumThs1 += deltaS * ((lastTHs + nextTHs) / 2);
        lastTH = nextTH;
        lastTHs = nextTHs;
        ++stepCount;
      }
    }

    results.push({
      s,
      stepCount,
      lastStep: deltaS,
      sumTh0,
      sumThs1,
    });
  }

  return results;
};

const createExpansionResults = (
  stretchValues: number[],
  integrationResults: IntegrationResult[],
  inputs: ExpansionInputs
): ExpansionResult[] => {
  const model = getModel(inputs);

  let sumThAt1 = 0;

  // Extract the results at s = 1.
  for (let i = 0; i < integrationResults.length; ++i) {
    if (integrationResults[i].s === 1) {
      ({ sumTh0: sumThAt1 } = integrationResults[i]);
      break;
    }
  }

  // Extract the results at s = Infinity.
  const sumThs1ToInfinity =
    integrationResults[integrationResults.length - 1].sumThs1;
  const sumTh0ToInfinity =
    integrationResults[integrationResults.length - 1].sumTh0;

  const results: ExpansionResult[] = [];

  let stretchValuesIndex = 0;
  // Do not take the last integration result: it is at infinity!
  for (let i = integrationResults.length - 2; i >= 0; --i) {
    if (integrationResults[i].s === stretchValues[stretchValuesIndex]) {
      const { s, sumTh0, sumThs1 } = integrationResults[i];

      const params = model.getParamsAtStretch(s);
      const {
        H_t,
        OmegaMatterT,
        OmegaLambdaT,
        OmegaRadiationT,
        TemperatureT,
        rhocrit,
        OmegaTotalT,
      } = params;

      // Current radius = ## \integral_0^s TH(s) ##.
      const Dnow = Math.abs(sumTh0 - sumThAt1);
      const Dthen = Dnow / s;
      const a = 1 / s;
      const Y = 1 / H_t;

      results.push({
        s, // Stretch.
        a,
        z: s - 1, // Redshift.
        Vnow: Dnow * model.H0conv,
        Vthen: Dthen * H_t,
        Tnow: sumThs1ToInfinity - sumThs1,
        Y,
        Dnow,
        Dthen,
        // Dhor: Y, // sumTh0 / s,
        //@TODO or should it be this per Ibix?
        Dhor: Y, // Math.max(sumTh0 / s, Y),
        XDpar: (a * H_t) / model.H0conv,
        Dpar: (sumTh0ToInfinity - sumTh0) / s,
        H_t,
        OmegaMatterT,
        OmegaLambdaT,
        OmegaRadiationT,
        TemperatureT,
        rhocrit,
        OmegaTotalT,
      });
      ++stretchValuesIndex;
    }
  }

  return results;
};

/**
 * Get a list of cosmic expansion results.
 *
 * @param inputs Inputs.
 * @returns
 */
const calculateExpansion = (inputs: ExpansionInputs): ExpansionResult[] => {
  // Calculate the values to calculate at.
  const stretchValues = getStretchValues(inputs);

  // Do the integration.
  const integrationResults = calculateExpansionForStretchValues(
    stretchValues,
    inputs
  );

  // Create the tabulated results.
  const results = createExpansionResults(
    stretchValues,
    integrationResults,
    inputs
  );

  return results;
};

const convertResultUnits = () => ({});

export { calculateExpansion, convertResultUnits };
