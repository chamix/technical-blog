# 🪵 Technical Logbook

> "Documenting complex systems is just another layer of platform engineering."

Welcome to my personal digital garden and technical engineering logbook. This repository serves as a centralized, version-controlled space (*Docs-as-Code*) where I track architectural blueprints, software abstractions, and deep technical essays. 

Built on top of **Astro** and powered by the **Starlight** documentation framework, this site is optimized for speed, local-first compilation, and structured content delivery.

---

## 📁 Repository Structure

```text
.
├── public/                 # Static assets (favicons, global open-graph images)
├── src/
│   ├── assets/             # Main architectural blueprints and vectorized designs
│   ├── content/
│   │   └── docs/           # The core knowledge base (Markdown & MDX essays)
│   │       ├── technical-articles/  # Mature, high-depth technical essays
│   │       └── index.mdx   # Landing page definition
│   └── content.config.ts   # Starlight content schema definitions
├── astro.config.mjs        # Main site configuration & Sidebar routing settings
├── .gitignore              # Automated workflow exclusions
└── package.json            # Tooling and dependencies