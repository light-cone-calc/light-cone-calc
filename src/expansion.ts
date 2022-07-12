// cosmic-expansion/src/expansion.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import { numerical } from '@rec-math/math';

import { getStretchValues } from './stretch-range.js';
import { create as createLcdmModel } from './model.js';

// export interface ExpansionInputs extends LcdmModelParameters {
export interface ExpansionInputs {
  /** Upper and lower bounds for stretch, or an array of values. */
  stretch: [upper: number, lower: number] | number[];
  /** The number of steps to take between the upper and lower stretch bounds. */
  steps?: number;
  /** Stretch steps are linear by default, set this to `true` for exponential steps. */
  exponentialSteps?: boolean;
}

type IntegrationResult = {
  s: number;
  t: number;
  dNow: number;
  // r: number;
  dPar: number;
};

/**
 * A full result from an expansion calculation.
 */
export type ExpansionResult = {
  /** Stretch \\( s = z + 1 \\). */
  s: number;
  /** Scale factor \\( a = 1 / (z + 1) \\). */
  a: number;
  /** Redshift. */
  z: number;
  /** Hubble parameter \\( kms^{-1}Mpsc^{-1} \\). */
  h: number;
  /** Time (Gy). */
  t: number;

  /** Hubble radius (Gly). */
  r: number;
  /** Proper distance of a source observed at this redshift (Gly). */
  dNow: number;
  /** Proper distance at this redshift when the light was emitted (Gly). */
  d: number;
  /** Particle horizon (Gly) */
  dPar: number;

  /** Recession rate of a source observed at this redshift (c = 1). */
  vNow: number;
  /** Recession rate at this redshift when the light was emitted (c = 1). */
  v: number;
  /** @todo document this! */
  vGen: number;

  /** Matter fraction of the critical energy density \\( \rho_{crit}^{-1} \\). */
  omegaM: number;
  /** Dark energy fraction of the critical density \\( \rho_{crit}^{-1} \\). */
  omegaLambda: number;
  /** Radiation density fraction of the critical density \\( \rho_{crit}^{-1} \\). */
  omegaRad: number;
  temperature: number;

  /** Critical density. */
  rhoCrit: number;
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
  // ascending order.
  const infty = Number.POSITIVE_INFINITY;
  const sPoints = stretchValues.slice().reverse();
  const isInfinityIncluded = sPoints[sPoints.length - 1] === infty;

  if (!isInfinityIncluded) {
    sPoints.push(infty);
  }

  // We assume zero is not included.
  sPoints.unshift(0);

  // Create a model for calculating the Hubble factor at a given stretch.
  const model = createLcdmModel(inputs);
  const { TH, THs } = model.getIntegralFunctions();

  const options = { epsilon: 1e-8 };

  const thResults = numerical.quad(TH, sPoints, options);
  const thPoints = thResults[1].points || [thResults];

  // Make sure we don't calculate THs at s = 0: discontinuity!
  const thsResults = numerical.quad(THs, sPoints.slice(1), options);
  // We may only have one point so this fix is needed.
  const thsPoints = thsResults[1].points || [thsResults];

  // Put in the initial value.
  thsPoints.unshift([0, { steps: 0, errorEstimate: 0, depth: 0 }]);

  const thAtOne = numerical.quad(TH, [0, 1], options)[0];
  const thAtInfinity = thResults[0];
  const thsAtInfinity = thsResults[0];

  // Create an array to build the return values.
  const results: IntegrationResult[] = [];

  // Discard the initial zero start point.
  sPoints.shift();
  const { h0Gy } = model.props;

  let th = 0;
  let ths = 0;
  for (let i = 0; i < sPoints.length - (isInfinityIncluded ? 0 : 1); ++i) {
    th += thPoints[i][0];
    ths += thsPoints[i][0];
    const s = sPoints[i];

    results.push({
      s,
      t: (thsAtInfinity - ths) / h0Gy,
      dNow: Math.abs(th - thAtOne) / h0Gy,
      dPar: (thAtInfinity - th) / s / h0Gy,
    });
  }

  return results;
};

const createExpansionResults = (
  integrationResults: IntegrationResult[],
  inputs: ExpansionInputs
): ExpansionResult[] => {
  const model = createLcdmModel(inputs);
  const { h0, h0Gy, kmsmpscToGyr } = model.props;

  const results: ExpansionResult[] = [];

  for (let i = integrationResults.length - 1; i >= 0; --i) {
    const { s, t, dNow: dUnsafe, dPar } = integrationResults[i];

    const params = model.getVariablesAtStretch(s);
    const hGy = params.h * kmsmpscToGyr;

    // Force dNow to zero at zero redshift.
    const dNow = s === 1 ? 0 : dUnsafe;
    results.push({
      z: s - 1,
      a: 1 / s,
      s,
      t,
      dNow,
      d: dNow / s,
      r: 1 / hGy,
      dPar,
      vGen: params.h / (s * h0),
      vNow: dNow * h0Gy,
      v: (dNow * hGy) / s,
      ...params,
    });
  }

  return results;
};

/**
 * Calculate the current age of the universe.
 *
 * @param inputs Inputs.
 * @returns
 */
const calculateAge = (inputs: ExpansionInputs): number => {
  // Do the integration.
  const { t } = calculateExpansionForStretchValues([1], inputs)[0];
  return t;
};

/**
 * Get a list of cosmic expansion results.
 *
 * @param inputs Inputs.
 * @returns
 */
const calculateExpansion = (inputs: ExpansionInputs): ExpansionResult[] => {
  // Calculate the values to calculate at.
  const stretchValues =
    inputs.stretch.length === 1
      ? // Pass the single point to calculate at.
        inputs.stretch
      : // Calculate multiple points.
        getStretchValues(inputs);

  // Do the integration.
  const integrationResults = calculateExpansionForStretchValues(
    stretchValues,
    inputs
  );

  // Create the tabulated results.
  const results = createExpansionResults(integrationResults, inputs);

  return results;
};

const convertResultUnits = () => ({});

export { calculateAge, calculateExpansion, convertResultUnits };
