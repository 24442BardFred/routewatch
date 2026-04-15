# routewatch

A lightweight CLI tool to monitor and diff REST API route changes across deployments.

## Installation

```bash
npm install -g routewatch
```

## Usage

Snapshot your API routes and compare them across deployments to catch breaking changes before they reach production.

**Take a snapshot:**
```bash
routewatch snapshot --url http://localhost:3000 --out routes.json
```

**Diff two snapshots:**
```bash
routewatch diff routes.v1.json routes.v2.json
```

**Example output:**
```
+ POST /api/v2/users
~ GET  /api/users/:id  →  /api/v2/users/:id
- DELETE /api/legacy/reset
```

**Watch mode (poll for changes):**
```bash
routewatch watch --url https://api.example.com --interval 60
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--url` | Base URL of the API to snapshot | — |
| `--out` | Output file for the snapshot | `routes.json` |
| `--interval` | Poll interval in seconds (watch mode) | `30` |
| `--format` | Output format: `text`, `json` | `text` |

## Requirements

- Node.js >= 16
- TypeScript >= 5.0

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

## License

[MIT](LICENSE)