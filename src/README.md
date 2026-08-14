# Source layout

- [`strategies`](./strategies): computes aggregate and temporal provenance data.
- [`controllers`](./controllers): records, serializes, registers, and replays provenance.
- [`types`](./types): public TypeScript contracts used by core and ProvenanceWidgets.
- [`shared`](./shared): the shared event name and small internal type utilities.

[`index.ts`](./index.ts) is the package's only public entry point.
