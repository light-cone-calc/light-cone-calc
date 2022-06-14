/**
 * Compute stretch range.
 */
type StretchInputs = {
  exponential?: boolean;
  stretch: [upper: number, lower: number] | number[];
  steps?: number;
};

/**
 * Add values to an existing array of steps, decreasing linearly.
 *
 * @param steps Existing steps to add new values to.
 * @param upper Upper bound (already in `steps`).
 * @param lower Lower bound.
 * @param count Number of steps to add.
 * @returns
 */
const addLinearStretchValues = (
  steps: number[],
  upper: number,
  lower: number,
  count: number
) => {
  const step = (upper - lower) / count;
  let current = upper;
  for (let i = 0; i < count - 1; ++i) {
    current -= step;
    steps.push(current);
  }
  steps.push(lower);

  return steps;
};

/**
 * Add values to an existing array of steps, decreasing exponentially.
 *
 * @param steps Existing steps to add new values to.
 * @param upper Upper bound (already in `steps`).
 * @param lower Lower bound.
 * @param count Number of steps to add.
 * @returns
 */
const addStretchValues = (
  steps: number[],
  upper: number,
  lower: number,
  count: number
) => {
  const factor = (lower / upper) ** (1 / count);
  let current = upper;
  for (let i = 0; i < count - 1; ++i) {
    current *= factor;
    steps.push(current);
  }
  steps.push(lower);

  return steps;
};

/**
 * Get a list of values for stretch factor s (i.e. 1 + redshift (z)).
 *
 * @todo Implement linear steps (currently only exponential).
 * @todo Deal with negative step values.
 * @param inputs Sanitized inputs.
 * @returns Sanitized inputs.
 */
const getStretchValues = (inputs: StretchInputs): number[] => {
  const { stretch, steps: stepCount, exponential } = inputs;

  // If there is no count we must have the values already.
  if (!stepCount) {
    return stretch;
  }

  // Get the bounds and add the first value.
  const [upper, lower] = stretch;
  const steps = [upper];

  if (lower > 1 || upper < 1) {
    // If s = 1 is not in the range just do even steps all the way down.
    if (exponential) {
      addStretchValues(steps, upper, lower, stepCount);
      return steps;
    }
    addLinearStretchValues(steps, upper, lower, stepCount);
    return steps;
  }

  if (exponential) {
    // Add steps separately above and below 1 to ensure s = 1 is included exactly.
    const factor = (lower / upper) ** (1 / stepCount);
    const countLower = Math.round(Math.log(lower) / Math.log(factor));
    // From upper down to 1.
    addStretchValues(steps, upper, 1, stepCount - countLower);
    // From 1 down to lower.
    addStretchValues(steps, 1, lower, countLower);
    return steps;
  }

  // Add steps separately above and below 1 to ensure s = 1 is included exactly.
  const step = (upper - lower) / stepCount;
  const countLower = Math.round((1 - lower) / step);
  // From upper down to 1.
  addLinearStretchValues(steps, upper, 1, stepCount - countLower);
  // From 1 down to lower.
  addLinearStretchValues(steps, 1, lower, countLower);
  return steps;
};

export { getStretchValues };
