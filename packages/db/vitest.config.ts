import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./src/test/globalSetup.ts"],
    // Tests share one database; run files sequentially.
    fileParallelism: false,
  },
});
