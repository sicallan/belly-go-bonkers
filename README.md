Belly Go Bonkers — Prototype

Run locally by opening `index.html` in a browser (no build step).

Quick test:

```bash
# from project root
xdg-open index.html
# or serve with a simple static server
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Controls:
- Press Space or Up arrow to jump
- Tap/Click to start and on touch devices swipe up to jump

What this prototype includes:
- Title screen with recent scores
- Simple Belly character (drawn as a circle) with belly-button face
- Auto-scrolling world, one obstacle type, and collectibles
- Score, lives, and localStorage recent-score persistence

Next steps:
- Polish artwork and sprite-sheet for `Belly`
- Improve collision feel and animations
- Add sound and more varied obstacles
