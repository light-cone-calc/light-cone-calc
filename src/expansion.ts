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

export type IntegrationResult = {
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

// const convertResultUnits = () => ({});
