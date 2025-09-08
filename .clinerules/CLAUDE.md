# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a documentation site for Voice Agents built with Astro and Starlight. It's a static site generator focused on creating clean, accessible documentation for voice agent integrations, use cases, and guides.

## Architecture & Structure

### Core Technology Stack
- **Astro** - Static site generator with component islands architecture
- **Starlight** - Documentation-focused Astro integration
- **starlight-theme-nova** - Custom theme plugin
- **TypeScript** - Type safety with strict configuration

### Content Organization
- `src/content/docs/` - All markdown documentation files
- `src/assets/` - Images and media assets organized by integration/topic
- `src/components/` - Reusable Astro components

### Key Content Sections (defined in astro.config.mjs sidebar):
1. **Getting Started** - Overview and introduction
2. **Integration** - Platform integrations (Shopify, WhatsApp, Google Calendar)
3. **Use Cases** - Industry-specific implementations (Retail, B2B, Healthcare)
4. **FAQ** - Common questions and troubleshooting

### Component Architecture
- `CallToActionBanner.astro` - Reusable banner with Google Calendar scheduling integration
- `RetailUseCases.astro` - Specialized component for retail use case displays
- Components use TypeScript interfaces for props validation

### Content Management
- Content uses Astro's content collections with schema validation
- MDX support for embedding components in markdown
- Images stored in `src/assets/` with relative linking from markdown

### Styling Approach
- Component-scoped CSS with Astro's style system
- Responsive design with mobile-first approach
- Dark mode support via data-theme attributes
- Uses GitHub light/dark themes for code syntax highlighting

## Integration Patterns

### Google Calendar Integration
The CallToActionBanner component integrates with Google Calendar's scheduling API:
- Loads external calendar scripts asynchronously
- Generates unique banner IDs to support multiple instances
- Handles DOM ready states and script loading timing
- Customizable button colors and text

### Image Asset Management
- Integration-specific image folders (shopify-integration/, whatsapp-integration/, etc.)
- Consistent naming patterns (image_1.png, image_2.png, etc.)
- Assets referenced via relative paths in markdown

## Content Guidelines

Based on existing content structure:
- Use CardGrid and Card components from Starlight for feature highlights
- Include CallToActionBanner for demo scheduling where appropriate
- Maintain consistent sidebar navigation structure defined in astro.config.mjs
- Follow existing naming conventions for integration and use case files