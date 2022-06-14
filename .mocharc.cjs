// .mocharc.cjs

module.exports = {
  extension: ['ts'],
  'node-option': [
    'experimental-specifier-resolution=node',
    'loader=ts-node/esm',
  ],
};
