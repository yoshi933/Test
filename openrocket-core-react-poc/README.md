OpenRocket Core CheerpJ PoC

This prototype runs only the upstream OpenRocket core module in CheerpJ. A small headless Java bridge exposes document loading, saving, inspection, and simulation operations without bundling the Swing application.

How to use:

1. Build the core runtime jars (this requires the upstream OpenRocket source to be present in `../openrocket` or `../original-opnerocket/openrocket` and Gradle available):
   npm run build:core

2. Start the dev server:
   npm install
   npm run dev

3. Open the forwarded port (8081) in Codespaces and click "Run core smoke simulation".

Notes:
- The build script assembles the upstream `openrocket-core-runtime.jar`, a stable `openrocket-core.jar` alias, `openrocket-core-bridge.jar`, and every runtime dependency under `public/engine/lib`.
- `runtime-manifest.json` is generated from the resolved Gradle runtime classpath so the browser does not rely on a hand-maintained dependency list.
- The page assumes CheerpJ loader script is available globally on the page as cheerpjInit/cheerpjRunMain.

The Java bridge supports these operations:

- `smoke`: create a new OpenRocket document and inspect it.
- `inspect <input.ork>`: load a native `.ork` document with the upstream loader.
- `roundtrip <input.ork> <output.ork>`: load and save a document with the upstream saver.
- `simulate <input.ork> [simulation-index]`: execute an existing simulation with the upstream simulation engine.

The upstream OpenRocket desktop UI is intentionally not included. React is responsible for the UI and should call the bridge operations or use the same Core APIs in a dedicated Java facade.

The generated runtime includes the upstream Core Jar plus its resolved runtime dependencies. Keep the complete `public/engine/lib` directory when deploying; removing a dependency can make only some Core features fail at runtime.
