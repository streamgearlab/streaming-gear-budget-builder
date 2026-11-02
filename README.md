# Streaming Gear Budget Builder

Set a budget from $100 to $1,000+, choose audio, video or lighting as your priority and describe your room to get a category-level streaming setup plan.

**Live tool:** https://streamgearlab.com/tools/streaming-gear-budget-builder/

## Features

- Splits your budget across microphone/audio, camera, lighting, headphones and room treatment
- Priority modes: balanced, audio, video or lighting first
- Room-aware advice (normal, echo, noisy, dark, window light, already treated)
- Skips gear you already own and lets you leave out a camera
- Category-level guidance (no specific product links)
- No tracking, no build step, works offline

## Usage

No install and no build step. It's plain HTML, CSS and JavaScript.

- **Online:** use the live tool at https://streamgearlab.com/tools/streaming-gear-budget-builder/ or the GitHub Pages demo at https://streamgearlab.github.io/streaming-gear-budget-builder/
- **Locally:** download or clone this repo and open `index.html` in your browser (it works straight from `file://`).

```sh
git clone https://github.com/streamgearlab/streaming-gear-budget-builder.git
cd streaming-gear-budget-builder
open index.html   # macOS; use xdg-open on Linux or just double-click it on Windows
```

You can prefill the form from the URL with these parameters: `budget`, `prio` (balanced, audio, video, lighting), `room`, `own`, `cam`. Example: `index.html?budget=300&prio=audio`

## Files

- `index.html`: page and form
- `app.js`: tool logic
- `style.css`: styles

## License

[MIT](LICENSE) © StreamGearLab

---

Made by [StreamGearLab](https://streamgearlab.com): free, no-nonsense tools and guides for streamers.
