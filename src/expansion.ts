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
  const getDensity = getDensityFunctionCalculator();

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
  let lastTH = getDensity(s);
  let lastTHs = lastTH / s;

  for (let i = 0; i < points.length; ++i) {
    const nextValue = points[i];

    if (isBelowOne) {
      while (s < nextValue) {
        // Trapezium rule step.
        // Calculate step length avoiding overshoot.
        deltaS = Math.min(deltaS * 1.001, nextValue - s);

        const nextTH = getDensity(s + deltaS);
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
        const nextTH = getDensity(s + deltaS);
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
        const nextTH = getDensity(s + deltaS);
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

const getModel = (inputs: SanitizedExpansionInputs) => {
  // Constants derived from inputs
  const { H0, Hconv, Omega, OmegaL, rhoConst, secInGy, s_eq, tempNow } = {
    ...planckModel,
    ...physicalConstants,
  };

  // Hubble constant at ?
  const H_0 = 67.74;

  const H0conv = H_0 * Hconv; // H0 in Gyr^-1
  const rhocritNow = rhoConst * (H0conv / secInGy) ** 2; // Critical density now
  const OmegaM = ((Omega - OmegaL) * s_eq) / (s_eq + 1); // Energy density of matter
  const OmegaR = OmegaM / s_eq; // Energy density of radiation
  const OmegaK = 1 - OmegaM - OmegaR - OmegaL; // Curvature energy density

  /**
   * Hubble constant as a function of stretch.
   *
   * @param s stretch = 1/a, where a is the usual FLRW scale factor.
   * @returns The Hubble constant at stretch s.
   */
  const H = (s: number) => {
    const s2 = s * s;
    return (
      1 /
      (H0conv *
        Math.sqrt(OmegaL + OmegaK * s2 + OmegaM * s2 * s + OmegaR * s2 * s2))
    );
  };

  const getParamsAtStretch = (s: number) => {
    const H_t = H(s);
    const s2 = s * s;
    const hFactor = (H_0 / H_t) ** 2;
    const OmegaMatterT = (Omega - OmegaL) * s2 * s * hFactor;
    const OmegaLambdaT = OmegaL * hFactor;
    const OmegaRadiationT = (OmegaMatterT * s) / s_eq;
    return {
      H_t,
      OmegaMatterT,
      OmegaLambdaT,
      OmegaRadiationT,
      TemperatureT: tempNow * s,
      rhocrit: rhoConst * (H_t / secInGy) ** 2,
      OmegaTotalT: OmegaMatterT + OmegaLambdaT + OmegaRadiationT,
    };
  };

  return {
    H_0,
    H,
    getParamsAtStretch,
  };
};

const createExpansionResults = (
  stretchValues: number[],
  integrationResults: IntegrationResult[],
  inputs: SanitizedExpansionInputs
): ExpansionResult[] => {
  const model = getModel(inputs);

  let sumThAt1 = 0;
  let sumThsAt1 = 0;

  // Extract the results at s = 1.
  for (let i = 0; i < integrationResults.length; ++i) {
    if (integrationResults[i].s === 1) {
      ({ sumTh0: sumThAt1, sumThs1: sumThsAt1 } = integrationResults[i]);
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

      // Current radius = ## \integral_0^s TH(s) ##.
      const Dnow = Math.abs(sumTh0 - sumThAt1);
      const Dthen = Dnow / s;

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

      results.push({
        s, // Stretch.
        a: 1 / s,
        z: s - 1, // Redshift.
        Vnow: Dnow * model.H_0,
        Vthen: Dthen * H_t,
        Tnow: sumThs1ToInfinity - sumThs1,
        // Y: number;
        Y: 99999999,
        Dnow,
        Dthen,
        Dhor: sumTh0 / s,
        // XDpar: number;
        XDpar: 999999,
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
  // Sanitize the inputs to avoid complications later.
  const sanitized = getSanitizedInputs(inputs);

  // Calculate the values to calculate at.
  const stretchValues = getStretchValues(sanitized);

  // Do the integration.
  const integrationResults = calculateExpansionForStretchValues(
    stretchValues,
    sanitized
  );

  // Create the tabulated results.
  const results = createExpansionResults(
    stretchValues,
    integrationResults,
    sanitized
  );

  return results;
};

const convertResultUnits = () => ({});

export { calculateExpansion, convertResultUnits };
