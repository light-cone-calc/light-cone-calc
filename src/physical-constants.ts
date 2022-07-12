/**
 * Convert gigayears to seconds.
 *
 * Calculated as 1e9 years * 365.25 days * 86,400 s using a Julian Year.
 *
 * @see https://www.iau.org/public/themes/measuring/
 */
export const gyrToSeconds = 3.15576e16;

/**
 * Conversion factor for the Hubble parameter.
 *
 * Convert from \\( km.s^{-1}Mpsc^{-1} \\) to Gyr. Calculation:
 *   - 1 parsec = \\( 648,000 / \pi \\) au.
 *   - 1 au = 149,597,870,700 m.
 *   - 1 Gyr = \\( 1e9 \times 365.25 \times 86,400 \\) s as above.
 * $$\frac{487,000 \pi }{1,495,978,707} \approx 1.022 712 165 045 694 937 e-3$$
 */
export const kmsmpscToGyr = 1.022712165045695e-3;

/**
 * $$ \frac{3}{8 \pi G} \approx 1.788 445 339 869 671 753 \times 10^9 $$
 */
export const rhoConst = 1.7884453398696718e9;
