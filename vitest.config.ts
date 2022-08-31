// eslint-disable-next-line import/extensions
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline: ['vitest-mock-process'],
    },
  },
});
