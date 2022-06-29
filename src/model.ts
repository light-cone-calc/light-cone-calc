// cosmic-inflation/src/model.ts

export type LcdmModel = {
  kmsmpscToGyr: number;
  H0GYr: number;
  H: (s: number) => number;
  getParamsAtStretch: (s: number) => LcdmModelVariables;
};

type LcdmModelVariables = {
  H_t: number;
  OmegaMatterT: number;
  OmegaLambdaT: number;
  OmegaRadiationT: number;
  TemperatureT: number;
  rhocrit: number;
  OmegaTotalT: number;
};

export const physicalConstants = {
  /**
   * Temperature of the cosmic microwave background radiation (K).
   *
   * @todo Find reference.
   */
  cmbtemperature: 2.72548,

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
 * @todo Verify Planck 2015 parameters.
 * @todo Verify WMAP 2013 parameters.
 */
const surveys = {
  planck2018: {
    h0: 67.66,
    omegalambda: 0.6889,
    zeq: 3387,
    omega: 1,
  },
  // Parameters from the Planck 2015 survey - unverified.
  planck2015: {
    h0: 67.74,
    omegalambda: 0.691,
    zeq: 3370,
    omega: 1,
  },
  // Parameters from the WMAP 2013 survey - unverified.
  wmap2013: {
    h0: 69.8,
    omegalambda: 0.72,
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
  omegalambda?: number;
  /** Redshift when matter and radiation densities were equal \\( z_{eq} \\). */
  zeq?: number;
  cmbtemperature?: number;
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
    omegalambda,
    zeq,
    cmbtemperature,
    gyrToSeconds,

    rhoConst,
  } = {
    ...physicalConstants,
    ...survey,
    ...options,
  };

  const H0GYr = h0 * kmsmpscToGyr;
  const seq = zeq + 1;

  // const rhocritNow = rhoConst * (H0conv / secInGy) ** 2; // Critical density now

  const OmegaM = ((omega - omegalambda) * seq) / (seq + 1); // Energy density of matter
  const OmegaR = OmegaM / seq; // Energy density of radiation

  const OmegaK = 1 - OmegaM - OmegaR - omegalambda; // Curvature energy density

  /**
   * Hubble constant as a function of stretch.
   *
   * @param s stretch = 1/a, where a is the usual FLRW scale factor.
   * @returns The Hubble constant at stretch s.
   */
  const H = (s: number) => {
    const s2 = s * s;
    return (
      H0GYr *
      Math.sqrt(omegalambda + OmegaK * s2 + OmegaM * s2 * s + OmegaR * s2 * s2)
    );
  };

  const getParamsAtStretch = (s: number): LcdmModelVariables => {
    const H_t = H(s);
    const s2 = s * s;
    // const hFactor = (H_0 / H_t) ** 2;
    const hFactor = (H0GYr / H_t) ** 2;
    const OmegaMatterT = (omega - omegalambda) * s2 * s * hFactor;
    const OmegaLambdaT = omegalambda * hFactor;
    const OmegaRadiationT = (OmegaMatterT * s) / seq;
    return {
      H_t,
      OmegaMatterT,
      OmegaLambdaT,
      OmegaRadiationT,
      TemperatureT: cmbtemperature * s,
      rhocrit: rhoConst * (H_t / gyrToSeconds) ** 2,
      OmegaTotalT: OmegaMatterT + OmegaLambdaT + OmegaRadiationT,
    };
  };

  return {
    kmsmpscToGyr,
    H0GYr,
    H,
    getParamsAtStretch,
  };
};
