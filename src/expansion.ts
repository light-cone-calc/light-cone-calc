// cosmic-expansion/src/expansion.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import type { LcdmModel, LcdmModelParameters } from './model';

import { numerical } from '@rec-math/math';

import { getStretchValues } from './stretch-range.js';
import { create as createLcdmModel } from './model.js';

export interface ExpansionInputs extends LcdmModelParameters {
  /** Upper and lower bounds for stretch, or an array of values. */
  stretch: [upper: number, lower: number] | number[];
  /** The number of steps to take between the upper and lower stretch bounds. */
  steps?: number;
  /** Stretch steps are linear by default, set this to `true` for exponential steps. */
  exponentialSteps?: boolean;
}

type IntegrationResult = {
  s: number;
  tNow: number;
  dNow: number;
  // dHor: number;
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
  /** Recession rate of a source observed at this redshift \\( c = 1 \\). */
  Vnow: number;
  /** Recession rate at this redshift when the light was emitted \\( c = 1 \\). */
  Vthen: number;
  /** Time since the end of inflation \\( GYr \\). */
  Tnow: number;
  Y: number;
  /** Proper distance of a source observed at this redshift \\( GYr \\). */
  Dnow: number;
  /** Proper distance at this redshift when the light was emitted \\( GYr \\). */
  Dthen: number;
  Dhor: number;
  XDpar: number;
  Dpar: number;
  hPerGyr: number; //H_t
  /** Matter fraction of the critical energy density \\( \rho_{crit}^{-1} \\). */
  OmegaMatterT: number;
  /** Dark energy fraction of the critical density \\( \rho_{crit}^{-1} \\). */
  OmegaLambdaT: number;
  /** Radiation density fraction of the critical density \\( \rho_{crit}^{-1} \\). */
  OmegaRadiationT: number;
  TemperatureT: number;
  /** Critical density ??? */
  rhocrit: number;
  /** Total energy density fraction of the critical density \\( \rho_{crit}^{-1} \\). */
  OmegaTotalT: number;
};

const getFunctionsFromModel = (model: LcdmModel) => {
  return {
    TH: (s: number): number => 1 / model.getHAtStretch(s),
    THs: (s: number): number => 1 / (s * model.getHAtStretch(s)),
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
  const { TH, THs } = getFunctionsFromModel(model);

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

  let th = 0;
  let ths = 0;
  for (let i = 0; i < sPoints.length - (isInfinityIncluded ? 0 : 1); ++i) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // ts-ignore
    th += thPoints[i][0];
    ths += thsPoints[i][0];
    const s = sPoints[i];

    results.push({
      s,
      tNow: thsAtInfinity - ths,
      dNow: Math.abs(th - thAtOne),
      dPar: (thAtInfinity - th) / s,
    });
  }

  return results;
};

const createExpansionResults = (
  integrationResults: IntegrationResult[],
  inputs: ExpansionInputs
): ExpansionResult[] => {
  const model = createLcdmModel(inputs);

  const results: ExpansionResult[] = [];

  for (let i = integrationResults.length - 1; i >= 0; --i) {
    const { s, tNow, dNow, dPar } = integrationResults[i];

    const params = model.getParamsAtStretch(s);
    const {
      // H_t,
      OmegaMatterT,
      OmegaLambdaT,
      OmegaRadiationT,
      TemperatureT,
      rhocrit,
      OmegaTotalT,
    } = params;

    const z = s - 1;
    // Force Dnow to zero at zero redshift.
    const Dnow = z === 0 ? 0 : dNow;
    // Current radius = ## \integral_0^s TH(s) ##.
    const Dthen = Dnow / s;
    const a = 1 / s;
    const hPerGyr = model.getHAtStretch(s);

    results.push({
      z,
      a,
      s, // Stretch.
      Tnow: tNow,
      // R
      Dnow,
      Dthen,
      Dhor: 1 / hPerGyr,
      Dpar: dPar,
      // XDpar seems to be reported as Vgen.
      XDpar: (a * hPerGyr) / model.H0GYr,
      Vnow: Dnow * model.H0GYr,
      Vthen: Dthen * hPerGyr,
      // The legacy test says we don't want to convert.
      // H_t: H_t / model.convertToGyr,
      hPerGyr,
      Y: 1 / hPerGyr,
      TemperatureT,
      rhocrit,
      OmegaMatterT,
      OmegaLambdaT,
      OmegaRadiationT,
      OmegaTotalT,
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
  const { tNow } = calculateExpansionForStretchValues([1], inputs)[0];
  return tNow;
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
