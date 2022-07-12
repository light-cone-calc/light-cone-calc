export type CosmicExpansionSurvey = {
  h0: number;
  omegaLambda0: number;
  zeq: number;
  omega0: number;
  temperature0: number;
};

/**
 * Parameters from the Planck 2018 survey.
 *
 * Planck 2018: https://arxiv.org/abs/1807.06209
 * @todo Check we have the right Planck 2018 parameters.
 * @todo Verify Planck 2015 parameters.
 * @todo Verify WMAP 2013 parameters.
 */
export const planck2018: CosmicExpansionSurvey = {
  h0: 67.66,
  omegaLambda0: 0.6889,
  zeq: 3387,
  omega0: 1,
  temperature0: 2.72548,
};

// Parameters from the Planck 2015 survey - unverified.
export const planck2015: CosmicExpansionSurvey = {
  h0: 67.74,
  omegaLambda0: 0.691,
  zeq: 3370,
  omega0: 1,
  temperature0: 2.72548,
};

// Parameters from the WMAP 2013 survey - unverified.
export const wmap2013: CosmicExpansionSurvey = {
  h0: 69.8,
  omegaLambda0: 0.72,
  zeq: 3300,
  omega0: 1,
  temperature0: 2.72548,
};
