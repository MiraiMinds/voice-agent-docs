// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeNova from "starlight-theme-nova";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  integrations: [
    starlight({
      title: "Voice Agents",
      social: [
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/T2pMwq5RVg",
        },
      ],
      plugins: [
        starlightThemeNova({
          // nav: [
          // 	{ label: 'Demo', href: 'https://voice.miraiminds.co' },
          // ],
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "guides/overview" },
            { label: "Campaign", slug: "guides/campaign" },
          ],
        },
        {
          label: "Integration",
          items: [
            { label: "Shopify", slug: "integration/shopify" },
            { label: "Whatsapp", slug: "integration/whatsapp" },
            { label: "Google Calendar", slug: "integration/google-calendar" },
          ],
        },
        {
          label: "Use Cases",
          items: [
            { label: "Retail", slug: "usecases/retail" },
            { label: "B2B", slug: "usecases/b2b" },
            { label: "Healthcare", slug: "usecases/healthcare" },
          ],
        },
        {
          label: "FAQ",
          items: [{ label: "Frequently asked Questions", slug: "guides/faq" }],
        },
      ],
    }),
  ],
});
