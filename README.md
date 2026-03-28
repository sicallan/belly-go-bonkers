# 🎮 Belly Go Bonkers!

> *A game invented by two kids, built by their dad with AI, and shared with the world.*

**[▶ Play Now](https://sicallan.github.io/belly-go-bonkers/)** &nbsp;|&nbsp; **[📚 Game Dev Academy](https://sicallan.github.io/belly-go-bonkers/learn/)**

---

## What is this?

Belly Go Bonkers is a side-scrolling endless runner for kids — dodge obstacles, collect candy, and survive 6 increasingly wild levels across mountains, ice worlds, candy lands, and haunted forests.

But it's also something else: a **real, readable game codebase** designed to teach children aged 6–11 how games are made.

---

## The Story

During school holidays, a dad (software engineer) sat down with his two children — aged 4 and 7 — and asked: *"What if we built our own game?"*

The kids invented everything:
- 🐣 **The character** — a round little creature with a belly button
- 🌍 **The 6 worlds** — mountains, snow, candy, haunted forest, the sky, and the final boss level
- 🚧 **The obstacles** — toy balls, bicycles, snowmen, candy canes, skateboards and more
- 👒 **The accessories** — Belly can wear hats!
- 🌀 **Bonkers Mode** — a chaos difficulty the kids absolutely insisted on

The whole thing was built using modern AI tools (Claude, Claude Code). The code was then cleaned up and documented specifically so other families could use it to learn.

[Read the full story →](https://sicallan.github.io/belly-go-bonkers/learn/story.html)

---

## Play the Game

No installation. No build step. Just open in a browser.

**Online:** https://sicallan.github.io/belly-go-bonkers/

**Locally:**
```bash
git clone https://github.com/sicallan/belly-go-bonkers.git
cd belly-go-bonkers
python3 -m http.server 8000
# open http://localhost:8000
```

### Controls
| Action | Keyboard | Touch |
|--------|----------|-------|
| Jump | `Space` or `↑` | Tap |
| Boost (hold) | Hold `Space` / `↑` | Hold |

---

## Game Dev Academy

The codebase is structured as a learning tool with three paths:

| Path | Ages | You'll learn |
|------|------|-------------|
| [⭐ Explorer](https://sicallan.github.io/belly-go-bonkers/learn/explorer.html) | 6–7 | Change colours, speeds, and scores by editing single values |
| [🔨 Builder](https://sicallan.github.io/belly-go-bonkers/learn/builder.html) | 8–9 | Add new obstacles, difficulty modes, and accessories |
| [✨ Creator](https://sicallan.github.io/belly-go-bonkers/learn/creator.html) | 10–11 | Understand the game loop, write helper functions, build a shield power-up |

Each task takes 10–20 minutes and produces a visible change in the game straight away.

---

## Project Structure

```
belly-go-bonkers/
├── index.html          # Game entry point
├── css/
│   └── styles.css      # Game styles
├── js/
│   ├── assets.js       # Sprites, sounds, and music (Web Audio API)
│   ├── entities.js     # Belly, Obstacle, Collectible, Plank classes
│   ├── input.js        # Keyboard and touch input
│   ├── renderer.js     # All drawing (HTML5 Canvas 2D)
│   └── game.js         # Game loop, state, scoring, levels
├── assets/             # Image and audio assets
└── learn/              # Game Dev Academy pages
    ├── index.html      # Academy hub
    ├── story.html      # How the game was made
    ├── explorer.html   # Path 1
    ├── builder.html    # Path 2
    ├── creator.html    # Path 3
    └── style.css       # Academy styles
```

---

## Built With

- Plain HTML, CSS, and JavaScript — no frameworks, no build step
- HTML5 Canvas for rendering
- Web Audio API for synthesised sound and music
- `localStorage` for score saving
- [Claude](https://claude.ai) and [Claude Code](https://claude.ai/code) for AI-assisted development

---

*Made with ☕, 🤖, and two very imaginative children. Shared with ❤️*
