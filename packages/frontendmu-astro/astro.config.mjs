import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import Icons from "unplugin-icons/vite";
import vue from "@astrojs/vue";
import sentry from "@sentry/astro";
let site = "https://coders.mu";

// https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables
if (
  process.env.VERCEL_ENV === "preview" ||
  process.env.VERCEL_ENV === "development"
) {
  site = `https://${process.env.VERCEL_URL}`;
}

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    mdx(),
    sitemap(),
    vue(),
    sentry({
      dsn: "https://84c18e268b3ee90a91bd54154ef66dc5@o4506644959985664.ingest.sentry.io/4506644963000320",
      sourceMapsUploadOptions: {
        project: "javascript-astro",
        authToken: process.env.SENTRY_AUTH_TOKEN
      },
      enabled: !import.meta.env.DEV,
    })],
  image: {
    domains: ["github.com", "githubusercontent.com"],
  },
  vite: {
    resolve: {
      dedupe: ["vue"],
    },
    define: {
      "import.meta.env.VERCEL_ANALYTICS_ID": JSON.stringify(
        process.env.VERCEL_ANALYTICS_ID
      ),
    },
    plugins: [
      Icons({
        compiler: "vue3",
        autoInstall: true,
      }),
    ],
    optimizeDeps: { exclude: ["fsevents"] },
  }
});
