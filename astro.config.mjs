// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeNova from "starlight-theme-nova";
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  site: "https://docs.miraiminds.co",
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  integrations: [
    mermaid(),
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
          nav: [
            { label: 'Docs', href: '/general/overview' },
            { label: 'Developers', href: '/developers/introduction' },
            { label: 'Schedule a Demo', href: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0xP6nxXZ5RWb6zQrYcADLF1-g6p-fyyMm5rdE6z6SHqNQPBPEJzoVdY--CLtVXGHy8H80RTyHV?gv=true' },
          ],
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "general/overview" },
            { label: "Campaign", slug: "general/campaign" },
          ],
        },
        {
          label: "Developers",
          items: [
            { label: "Introduction", slug: "developers/introduction" },
            { label: "Create Assistant", slug: "developers/create-assistant" },
            { label: "Make a Call", slug: "developers/make-a-call" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Abandon Cart Recovery", slug: "guide/abandon-cart-recovery" },
          ]
        },
        {
          label: "Integration",
          items: [
            { label: "Shopify", slug: "integration/shopify" },
            { label: "Whatsapp", slug: "integration/whatsapp" },
            { label: "Lime Chat", slug: "integration/limechat" },
            { label: "Klaviyo", slug: "integration/klaviyo" },
            { label: "Google Calendar", slug: "integration/google-calendar" },
          ],
        },
        {
          label: "Use Cases",
          items: [
            { label: "Retail", slug: "usecases/retail" },
            { label: "B2B", slug: "usecases/b2b" },
            // { label: "Healthcare", slug: "usecases/healthcare" },
          ],
        },
        {
          label: "FAQ",
          items: [{ label: "Frequently asked Questions", slug: "general/faq" }],
        },
      ],
    }),
  ],
});
