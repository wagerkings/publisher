# Social Media Image Agent

A TypeScript/Node.js CLI tool that watches `models/{model}/raw/` for images and generates platform-specific outputs for Instagram, Facebook, and OnlyFans in feed/profile/banner formats.

## Features

- File watching for new/changed images
- Config-driven presets for multiple social platforms
- SQLite manifest for idempotent processing
- Concurrent processing with error isolation
- Auto-rotation based on EXIF data
- Quality and format optimization per platform

## Installation

```bash
npm install
npm run build
```

## Usage

### Watch Mode

Watch for new/changed images in all model directories:

```bash
npm run dev watch
# or after build:
npm start watch
```

### Process Single File

```bash
npm run dev process --model alice --file path/to/image.jpg
```

### Process All Files in Model

```bash
npm run dev process --model alice --all
```

### Check Status

```bash
npm run dev status --model alice
```

## Configuration

Edit `config/presets.json` to customize platform presets, dimensions, quality settings, and processing options.

## Directory Structure

- `models/{model}/raw/` - Input images (watched)
- `models/{model}/{social}/{type}/` - Generated outputs
  - `{social}`: instagram, facebook, onlyfans
  - `{type}`: feed, profile, banner

## Development

```bash
npm run dev watch  # Run in watch mode with tsx
npm run build      # Compile TypeScript
npm start watch    # Run compiled version
```

