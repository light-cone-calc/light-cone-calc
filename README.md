# LightConeCalc

> A Javascript cosmological calculator for the expansion of the universe.

## Usage

### v1.x - stable

```html
<script src="https://cdn.jsdelivr.net/npm/light-cone-calc@1"></script>
```

### v1.0.0-dev - development

```html
<script src="https://cdn.jsdelivr.net/npm/light-cone-calc@develop"></script>
```

### v0.2.x - legacy

```html
<script src="https://cdn.jsdelivr.net/npm/light-cone-calc@0.2"></script>
```

In each case the API is similar to the legacy module:

```js
const inputs = {
  s_eq: 3370,
  Ynow,
  Yinf: Ynow / Math.sqrt(OmegaL),
  s_upper: z_upper + 1,
  s_lower: z_lower + 1,
  s_step: steps,
  exponential: true,
  Omega,
};
const results = LightConeCalc.Calculate(inputs);
```
