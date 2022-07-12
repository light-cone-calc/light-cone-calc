// cosmic-expansion/src/model.ts

import * as physicalConstants from './physical-constants.js';
import * as surveyParameters from './survey-parameters.js';

/**
 * H(s)^2 = H_0^2 (\Omega_m s^3 + \Omega_{rad} s^4 + \Omega_\Lambda s^{3(1+w)} + \Omega_k s^2 )
 */

interface CosmicExpansionVariables {
  h: number;
  omegaM: number;
  omegaLambda: number;
  omegaRad: number;
  temperature: number;
  rhoCrit: number;
}

/**
 * These parameters may be passed to `create()` to override default parameters.
 */
export interface LcdmModelParameters {
  /** Hubble constant \\( H_0 \\) (in km/s/Mpsc). */
  h0?: number;
  /** Total density paramater \\( \Omega_{tot} \\). */
  omega0?: number;
  /** Dark energy density parameter \\( \Omega_\Lambda \\). */
  omegaLambda0?: number;
  /** Redshift when matter and radiation densities were equal \\( z_{eq} \\). */
  zeq?: number;
  temperature0?: number;
  // Conversion: multiply (a hubble factor) km/s/Mpsc to get years * 10^9.
  kmsmpscToGyr?: number;
  // Conversion: multiply years * 10^9 to get seconds.
  gyrToSeconds?: number;

  rhoConst?: number;
}

interface CosmicExpansionModelProps {
  h0: number;
  h0Gy: number;
  omegaLambda0: number;
  OmegaK0: number;
  omegaM0: number;
  omegaRad0: number;
  rhoCrit0: number;
  /** Temperature of the cosmic microwave background radiation (K). */
  temperature0: number;

  /** $$ \frac{3}{8 \pi G} \approx 1.788 445 339 869 671 753 \times 10^9 $$ */
  rhoConst: number;
  /** Convert gigayears to seconds. */
  gyrToSeconds: number;
  /** Conversion factor for the Hubble parameter. */
  kmsmpscToGyr: number;
}

interface CosmicExpansionModelOptions {
  // The key of a survey to use for parameters (defaults to `planck2018`).
  survey?: 'planck2018' | 'planck2015' | 'wmap2013';
  [key: string]: any;
}

class CosmicExpansionModel {
  props: CosmicExpansionModelProps;

  getESquaredAtStretch: (s: number) => number;
  getVariablesAtStretch: (s: number) => CosmicExpansionVariables;

  constructor(options: CosmicExpansionModelOptions) {
    this.props = this.createProps(options);
    this.getESquaredAtStretch = this.createESquaredAtStretchFunction();
    // MUST create `this.getESquaredAtStretch` first.
    this.getVariablesAtStretch = this.createVariablesAtStretchFunction();
  }

  createProps(options: CosmicExpansionModelOptions): CosmicExpansionModelProps {
    // Constants derived from inputs
    const survey =
      options.survey && surveyParameters[options.survey]
        ? surveyParameters[options.survey]
        : surveyParameters['planck2018'];
    const props = {
      ...physicalConstants,
      ...survey,
      ...options,
    };

    const {
      kmsmpscToGyr,
      h0,
      omega0,
      omegaLambda0,
      zeq,

      gyrToSeconds,
      rhoConst,
    } = props;

    const h0Gy = h0 * kmsmpscToGyr;
    const seq = zeq + 1;
    const h0Seconds = (h0 * kmsmpscToGyr) / gyrToSeconds;

    // Calculate current density parameters.
    const rhoCrit0 = rhoConst * h0Seconds * h0Seconds;
    const omegaM0 = ((omega0 - omegaLambda0) * seq) / (seq + 1);
    const omegaRad0 = omegaM0 / seq;
    const OmegaK0 = 1 - omegaM0 - omegaRad0 - omegaLambda0;

    return {
      h0Gy,
      rhoCrit0,
      omegaM0,
      omegaRad0,
      OmegaK0,

      ...props,
    };
  }

  /**
   * Hubble constant as a function of stretch.
   *
   * @param s stretch = 1/a, where a is the usual FLRW scale factor.
   * @returns The Hubble constant at stretch s.
   */
  createESquaredAtStretchFunction() {
    const { omegaLambda0, OmegaK0, omegaM0, omegaRad0 } = this.props;
    return (s: number) => {
      const s2 = s * s;
      return (
        omegaLambda0 + OmegaK0 * s2 + omegaM0 * s2 * s + omegaRad0 * s2 * s2
      );
    };
  }

  createVariablesAtStretchFunction() {
    const { getESquaredAtStretch } = this;
    const { h0, temperature0, omegaLambda0, omegaM0, omegaRad0, rhoCrit0 } =
      this.props;
    return (s: number): CosmicExpansionVariables => {
      const eSquared = getESquaredAtStretch(s);
      const s2 = s * s;
      const h = h0 * Math.sqrt(eSquared);
      const omegaM = (omegaM0 * s2 * s) / eSquared;
      const omegaLambda = omegaLambda0 / eSquared;
      const omegaRad = (omegaRad0 * s2 * s2) / eSquared;
      return {
        h,
        omegaM,
        omegaLambda,
        omegaRad,
        temperature: temperature0 * s,
        rhoCrit: rhoCrit0 * eSquared,
      };
    };
  }

  getIntegralFunctions() {
    const { getESquaredAtStretch } = this;
    return {
      TH: (s: number): number => 1 / Math.sqrt(getESquaredAtStretch(s)),
      THs: (s: number): number => 1 / (s * Math.sqrt(getESquaredAtStretch(s))),
    };
  }
}

export const create = (
  options: CosmicExpansionModelOptions
): CosmicExpansionModel => {
  return new CosmicExpansionModel(options);
};
