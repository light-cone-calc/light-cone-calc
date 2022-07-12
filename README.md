# CosmicExpansion

> A Javascript cosmological calculator for the expansion of the universe.

This code is parked for the move to cosmic-expansion.

## Quick start

For use in a browser include minimized code from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/cosmic-expansion"></script>
```

Legacy API:

```js
const results = LightConeCalc.Calculate({;
  s_eq: 3370,
  Ynow,
  Yinf: Ynow / Math.sqrt(OmegaL),
  s_upper: z_upper + 1,
  s_lower: z_lower + 1,
  s_step: steps,
  Omega,
});
```

## Development

Pull requests against the `develop` branch welcome.
