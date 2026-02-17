# velist.dev

> Documentation website for Velist Framework

Built with [VitePress](https://vitepress.dev).

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

## Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment

Deploy ke Cloudflare Pages:

```bash
# Deploy (otomatis ke project 'velist')
bun run deploy

# Atau manual
bunx wrangler pages deploy docs/.vitepress/dist --project-name velist --branch main
```

⚠️ **Jangan ganti project name!** Selalu pakai `--project-name velist`

## Contributing

See [Contributing Guide](https://github.com/velist-framework/velist/blob/main/CONTRIBUTING.md)
