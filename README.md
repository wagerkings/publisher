# Social Media Image Agent

Automatically processes images from `models/{model}/raw/` and generates platform-specific outputs (Instagram, Facebook, OnlyFans) in feed/profile/banner formats.

## Features

- **Auto-processing** - Watches for new/changed images and processes them automatically
- **Multi-platform** - Generates outputs for Instagram, Facebook, and OnlyFans
- **Image enhancements** - Optional automatic enhancements (brightness, shadows, highlights, contrast, noise reduction)
- **Idempotent** - Only reprocesses images when source files change
- **Configurable** - Customize dimensions, quality, and enhancement settings per platform

## Quick Start

```bash
npm install
npm run build

# Watch for new images
npm run dev -- watch

# Process a single file
npm run dev -- process --model alice --file path/to/image.jpg

# Process all files for a model
npm run dev -- process --model alice --all

# Force rerender (removes all outputs and reprocesses)
npm run dev -- process --model alice --all --force

# Check status
npm run dev -- status --model alice
```

## Configuration

Edit `config/presets.json` to customize:

- **Platform dimensions** - Width/height per platform and type (feed/profile/banner)
- **Image quality** - JPEG quality settings
- **Enhancements** - Optional automatic improvements (brightness, shadows, highlights, contrast, noise reduction)
- **Processing options** - Crop strategy, concurrency, etc.

Enhancements can be enabled/disabled globally and configured per image type (feed/profile/banner).

## Output Structure

```
models/
  {model}/
    raw/              # Input images (watched)
    instagram/
      feed/           # Generated outputs
      profile/
      banner/
    facebook/
      feed/
      profile/
      banner/
    onlyfans/
      feed/
      profile/
      banner/
```
