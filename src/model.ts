// cosmic-expansion/src/model.ts
/**
 * H(s)^2 = H_0^2 (\Omega_m s^3 + \Omega_{rad} s^4 + \Omega_\Lambda s^{3(1+w)} + \Omega_k s^2 )
 */
export type LcdmModel = {
  /** Temperature of the cosmic microwave background radiation (K). */
  cmbTemperature: number;

  /** $$ \frac{3}{8 \pi G} \approx 1.788 445 339 869 671 753 \times 10^9 $$ */
  rhoConst: number;

  /** Convert gigayears to seconds. */
  gyrToSeconds: number;

  /** Conversion factor for the Hubble parameter. */
  kmsmpscToGyr: number;

  h0: number;
  h0Gy: number;
  getESquaredAtStretch: (s: number) => number;
  getParamsAtStretch: (s: number) => LcdmModelVariables;
};

type LcdmModelVariables = {
  h: number;
  omegaM: number;
  omegaLambda: number;
  omegaRad: number;
  temperature: number;
  rhoCrit: number;
};

export const physicalConstants = {
  /**
   * Temperature of the cosmic microwave background radiation (K).
   *
   * @todo Find reference.
   */
  cmbTemperature: 2.72548,

  /**
   * $$ \frac{3}{8 \pi G} \approx 1.788 445 339 869 671 753 \times 10^9 $$
   */
  rhoConst: 1.7884453398696718e9,

  /**
   * Convert gigayears to seconds.
   *
   * Calculated as 1e9 years * 365.25 days * 86,400 s using a Julian Year.
   *
   * @see https://www.iau.org/public/themes/measuring/
   */
  gyrToSeconds: 3.15576e16, // 1e9 years * 365.25 days * 86400 s

  /**
   * Conversion factor for the Hubble parameter.
   *
   * Convert from \\( km.s^{-1}Mpsc^{-1} \\) to Gyr. Calculation:
   *   - 1 parsec = \\( 648,000 / \pi \\) au.
   *   - 1 au = 149,597,870,700 m.
   *   - 1 Gyr = \\( 1e9 \times 365.25 \times 86,400 \\) s as above.
   * $$ \frac{487,000 \pi }{1,495,978,707} \approx 1.022 712 165 045 694 937 $$
   */
  kmsmpscToGyr: 1.022712165045695e-3,
};

/**
 * Parameters from the Planck 2018 survey.
 *
 * Planck 2018: https://arxiv.org/abs/1807.06209
 * @todo Check we have the right Planck 2018 parameters.
 * @todo Verify Planck 2015 parameters.
 * @todo Verify WMAP 2013 parameters.
 */
const surveys = {
  // Parameters from the Planck 2018 survey - are these the right ones?
  planck2018: {
    h0: 67.66,
    omegaLambda0: 0.6889,
    zeq: 3387,
    omega: 1,
  },
  // Parameters from the Planck 2015 survey - unverified.
  planck2015: {
    h0: 67.74,
    omegaLambda0: 0.691,
    zeq: 3370,
    omega: 1,
  },
  // Parameters from the WMAP 2013 survey - unverified.
  wmap2013: {
    h0: 69.8,
    omegaLambda0: 0.72,
    zeq: 3300,
    omega: 1,
  },
};

/**
 * These parameters may be passed to `create()` to override default parameters.
 */
export interface LcdmModelParameters {
  /** Hubble constant \\( H_0 \\) (in km/s/Mpsc). */
  h0?: number;
  /** Total density paramater \\( \Omega_{tot} \\). */
  omega?: number;
  /** Dark energy density parameter \\( \Omega_\Lambda \\). */
  omegaLambda0?: number;
  /** Redshift when matter and radiation densities were equal \\( z_{eq} \\). */
  zeq?: number;
  cmbTemperature?: number;
  // Conversion: multiply (a hubble factor) km/s/Mpsc to get years * 10^9.
  kmsmpscToGyr?: number;
  // Conversion: multiply years * 10^9 to get seconds.
  gyrToSeconds?: number;
  // The key of a survey to use for parameters (defaults to `planck2018`).
  survey?: 'planck2018' | 'planck2015' | 'wmap2013';
  rhoConst?: number;
}

export const create = (options: LcdmModelParameters): LcdmModel => {
  // Constants derived from inputs
  const survey = surveys[options.survey || 'planck2018'];
  const {
    kmsmpscToGyr,
    h0,
    omega,
    omegaLambda0,
    zeq,
    cmbTemperature,
    gyrToSeconds,

    rhoConst,
  } = {
    ...physicalConstants,
    ...survey,
    ...options,
  };

  const h0Gy = h0 * kmsmpscToGyr;
  const seq = zeq + 1;
  const h0Seconds = (h0 * kmsmpscToGyr) / gyrToSeconds;
  const rhoCrit0 = rhoConst * h0Seconds * h0Seconds;

  const omegaM0 = ((omega - omegaLambda0) * seq) / (seq + 1); // Energy density of matter
  const omegaRad0 = omegaM0 / seq; // Energy density of radiation

  const OmegaK = 1 - omegaM0 - omegaRad0 - omegaLambda0; // Curvature energy density

  /**
   * Hubble constant as a function of stretch.
   *
   * @param s stretch = 1/a, where a is the usual FLRW scale factor.
   * @returns The Hubble constant at stretch s.
   */
  const getESquaredAtStretch = (s: number) => {
    const s2 = s * s;
    return omegaLambda0 + OmegaK * s2 + omegaM0 * s2 * s + omegaRad0 * s2 * s2;
  };

  const getParamsAtStretch = (s: number): LcdmModelVariables => {
    const eSquared = getESquaredAtStretch(s);
    const s2 = s * s;
    // ## \Omega_m = H*2 / H_0^2 / s^3 ##.
    const omegaM = (omegaM0 * s2 * s) / eSquared;
    const omegaLambda = omegaLambda0 / eSquared;
    const omegaRad = (omegaRad0 * s2 * s2) / eSquared;
    const h = h0 * Math.sqrt(eSquared);
    return {
      h,
      omegaM,
      omegaLambda,
      omegaRad,
      temperature: cmbTemperature * s,
      rhoCrit: rhoCrit0 * eSquared,
    };
  };

  return {
    cmbTemperature,
    rhoConst,
    gyrToSeconds,
    kmsmpscToGyr,
    h0,
    h0Gy,
    getESquaredAtStretch,
    getParamsAtStretch,
  };
};
