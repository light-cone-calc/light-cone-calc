# LightConeCalc

> A Javascript cosmological calculator for the expansion of the universe.

## Usage

### v1.x - stable

[![Build](https://github.com/lightcone7/light-cone-calc/actions/workflows/node.js.yaml/badge.svg)](https://github.com/lightcone7/light-cone-calc/actions/workflows/node.js.yaml)

```html
<script src="https://cdn.jsdelivr.net/npm/light-cone-calc@1"></script>
```

Running at https://lightcone7.github.io/LightCone7.html.

### v1.x.x-dev - development

[![Build](https://github.com/lightcone7/light-cone-calc/actions/workflows/node.js.yaml/badge.svg?branch=develop)](https://github.com/lightcone7/light-cone-calc/actions/workflows/node.js.yaml)

```html
<script src="https://cdn.jsdelivr.net/npm/light-cone-calc@develop"></script>
```

Running at https://lightcone7.github.io/LightCone7-develop.html.

### v0.2.x - legacy

```html
<script src="https://cdn.jsdelivr.net/npm/light-cone-calc@0.2"></script>
```

Running at https://lightcone7.github.io/LightCone7-legacy.html.

In each case the API is similar to the legacy module:

```js
const inputs = {
  s_eq: 3370,
  Ynow,
  Yinf: Ynow / Math.sqrt(OmegaL),
  s_upper: z_upper + 1,
  s_lower: z_lower + 1,
  s_step: steps,
  // exponential: true, // default
  Omega,
};
const results = LightConeCalc.Calculate(inputs);
```
