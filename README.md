# @provenance-widgets/core

Framework-independent provenance computation for ProvenanceWidgets 2.x.

## Architecture

- `controllers`: recording, serialization, widget registration, and replay.
- `strategies`: numeric, range, text, selection, and super-provenance data.
- `types`: public TypeScript contracts.
- `shared`: the shared event name and internal type utilities.

See [`src/README.md`](src/README.md) for the source layout.

## Install

```bash
npm install @provenance-widgets/core
```

## Development

```bash
npm install
```

## Deployment

```bash
npm run verify
npm login --auth-type=web
npm whoami
npm pack --dry-run
npm publish --access public
```