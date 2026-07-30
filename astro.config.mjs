// @ts-check
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";
import starlightThemeNova from "starlight-theme-nova";

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
      // The standing Mirai theme. Self-hosted fonts + tokens; see src/styles/mirai.css.
      customCss: ["./src/styles/mirai.css"],
      components: { SiteTitle: "./src/components/SiteTitle.astro" },
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
            { label: "Docs", href: "/general/overview" },
            { label: "API", href: "/v2/" },
            { label: "Pricing", href: "/general/tiers" },
            {
              label: "Schedule a Demo",
              href: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0xP6nxXZ5RWb6zQrYcADLF1-g6p-fyyMm5rdE6z6SHqNQPBPEJzoVdY--CLtVXGHy8H80RTyHV?gv=true",
            },
          ],
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "general/overview" },
            { label: "Billing & Tiers", slug: "general/tiers" },
            { label: "Roadmap", slug: "general/roadmap" },
            { label: "Campaign", slug: "general/campaign" },
          ],
        },
        {
          label: "API v2",
          badge: { text: "New", variant: "success" },
          items: [
            { label: "Overview", slug: "v2" },
            { label: "Quickstart", slug: "v2/quickstart" },
            { label: "Agents", slug: "v2/agents" },
            { label: "Voices", slug: "v2/voices" },
            { label: "Calls", slug: "v2/calls" },
            { label: "Wallet", slug: "v2/wallet" },
            { label: "Webhooks", slug: "v2/webhooks" },
            { label: "Errors", slug: "v2/errors" },
            { label: "Limits & Compliance", slug: "v2/limits" },
            {
              label: "Node graphs",
              slug: "v2/node-graphs",
              badge: { text: "Preview", variant: "caution" },
            },
            { label: "Migrating from v1", slug: "v2/migration" },
            { label: "FAQ", slug: "v2/faq" },
          ],
        },
        {
          label: "API v1 (stable)",
          collapsed: true,
          items: [
            { label: "Overview", slug: "v1" },
            { label: "Workspaces", slug: "v1/workspaces" },
            { label: "Assistants", slug: "v1/assistants" },
            { label: "Calls", slug: "v1/calls" },
            { label: "Webhooks", slug: "v1/webhooks" },
            { label: "Telephony", slug: "v1/telephony" },
            { label: "API Tools", slug: "v1/tools" },
            { label: "Knowledge Base", slug: "v1/knowledge-base" },
          ],
        },
        {
          label: "Guides (legacy)",
          collapsed: true,
          items: [
            { label: "Introduction", slug: "developers/introduction" },
            { label: "Create Assistant", slug: "developers/create-assistant" },
            { label: "Make a Call", slug: "developers/make-a-call" },
            { label: "Call Lifecycle", slug: "developers/call-lifecycle-events" },
            { label: "Webhook Signature", slug: "developers/webhook-signature" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Abandon Cart Recovery", slug: "guide/abandon-cart-recovery" },
            { label: "How Discounts Work", slug: "guide/how-discounts-work" },
          ],
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
