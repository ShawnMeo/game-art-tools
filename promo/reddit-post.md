# Reddit Launch Post

Copy this entire post for r/gamedev, r/unrealengine, r/blender, or similar subreddits.

---

## Title Options (choose one)

1. `I built a free suite of browser tools for game artists - no signup, no download`
2. `[Tool] Free Channel Packer, Trim Sheet Planner, and more - browser-based game art utilities`
3. `Made some free tools to solve my own game art pain points - sharing with the community`

---

## Post Body

Hey everyone,

I'm a game artist who kept running into the same workflow annoyances:

- Needing to open Photoshop just to pack a few grayscale masks into channels
- Wanting to plan trim sheet layouts before committing to hours of texturing
- Creating texture presentation sheets for every material in my portfolio

So I built a suite of browser tools to handle these tasks. Everything runs locally in your browser—no downloads, no account creation, completely free.

**🔗 Link:** https://shawnmeo.github.io/game-art-tools/build/

---

### What's Included

**📦 Channel Packer**
Drag and drop up to 4 grayscale maps (roughness, metallic, AO, etc.) and export them as a single channel-packed RGBA texture. Super useful for creating ORM textures or custom mask maps.

**🗺️ Trim Sheet Planner**
Visual tool to plan your trim sheet layouts before you start texturing. Define segments, visualize UV usage, export as reference.

**🖼️ Material Sheet Generator**  
Upload your texture maps and generate a clean presentation sheet. Great for portfolios and asset store listings.

---

### Why Browser-Based?

- **No installation** - works on any machine
- **No waiting** - instant access
- **No account** - your files stay on your machine
- **Always updated** - no version management

---

### Tech Details (for the curious)

Everything is built with vanilla HTML/CSS/JS and React for the more complex tools. Files are processed client-side using Canvas API—nothing gets uploaded to any server.

---

Happy to hear feedback or feature requests. These are tools I use in my own workflow, so if something would help you, there's a good chance I'd find it useful too.

---

## Suggested Flair

`Resource` or `Tool` (depending on subreddit)

---

## Reply Templates

### For "How did you build this?"
```
Built with React + Vite for the more complex tools, plain HTML/JS for the simpler ones. All image processing happens client-side using the Canvas API. Hosted on GitHub Pages - completely static, no backend.
```

### For feature requests
```
Thanks for the suggestion! I'm keeping a list of feature requests - if it's something I'd use in my own workflow, there's a good chance I'll add it. Feel free to drop more ideas.
```

### For "Are you going to monetize?"
```
No plans to paywall any of the current tools. If I add more advanced features in the future, I might consider a "pro" tier, but the core utilities will stay free.
```
