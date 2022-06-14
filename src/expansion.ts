/**
 * Calculate expansion results.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { integrate } from '@rec-math/math/esm/index.js';
import { getStretchValues } from './stretch-range.js';
import { getModel } from './model.js';

export interface ExpansionInputs {
  Ynow?: number;
  Yinf?: number;
  s_eq?: number;
  Omega?: number;
  OmegaL?: number;
  H0GYr?: number;
  exponential?: boolean;
  stretch: [upper: number, lower: number] | number[];
  steps?: number;
}

type IntegrationResult = {
  s: number;
  tNow: number;
  dNow: number;
  // dHor: number;
  dPar: number;
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
  // ascending order.
  const infty = Number.POSITIVE_INFINITY;
  const sPoints = stretchValues.slice().reverse();
  const isInfinityIncluded = sPoints[sPoints.length - 1] === infty;

  if (!isInfinityIncluded) {
    sPoints.push(infty);
  }

  // We assume zero is not included.
  sPoints.unshift(0);

  // Get a calculator for density using any provided overrides.
  const { TH, THs } = getModel(inputs);
  const options = { maxDepth: 16 };

  const thResults = integrate.quad(TH, sPoints, options);
  // Make sure we don't calculate THs at s = 0: discontinuity!
  const thsResults = integrate.quad(THs, sPoints.slice(1), options);
  // Put in the initial value.
  thsResults[1].points.unshift([0, {}]);
  const thAtOne = integrate.quad(TH, [0, 1], options)[0];
  const thAtInfinity = thResults[0];
  const thsAtInfinity = thsResults[0];

  // Create an array to build the return values.
  const results: IntegrationResult[] = [];

  // Discard the initial zero start point.
  sPoints.shift();

  let th = 0;
  let ths = 0;
  for (let i = 0; i < sPoints.length - (isInfinityIncluded ? 0 : 1); ++i) {
    th += thResults[1].points[i][0];
    ths += thsResults[1].points[i][0];
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
  const model = getModel(inputs);

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

    // Current radius = ## \integral_0^s TH(s) ##.
    const Dthen = dNow / s;
    const a = 1 / s;
    const H_t = model.H(s);

    results.push({
      z: s - 1, // Redshift.
      a,
      s, // Stretch.
      Tnow: tNow,
      // R
      Dnow: dNow,
      Dthen,
      Dhor: 1 / H_t,
      Dpar: dPar,
      // XDpar seems to be reported as Vgen.
      XDpar: (a * H_t) / model.H0GYr,
      Vnow: dNow * model.H0GYr,
      Vthen: Dthen * H_t,
      // Do we need both H_t and Y?
      H_t: H_t / model.convertToGyr,
      Y: 1 / H_t,
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
  const results = createExpansionResults(integrationResults, inputs);

  return results;
};

const convertResultUnits = () => ({});

export { calculateExpansion, convertResultUnits };
