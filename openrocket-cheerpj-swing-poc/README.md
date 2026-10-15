# OpenRocket Swing CheerpJ PoC

This repository contains a research scaffold for testing whether the existing OpenRocket Swing application can be launched in a browser via CheerpJ without rewriting the UI in React.

Important:
- This project is a research and verification prototype only.
- It does not contain the upstream OpenRocket codebase or a binary OpenRocket build.
- It does not claim that the real OpenRocket Swing app runs in CheerpJ yet.
- The goal is to prepare the environment, bootstrap the runtime, and document the investigation path for future validation.

## Purpose

The purpose of this prototype is to verify the following conditions in a controlled browser environment:

- CheerpJ can initialize successfully.
- A Swing window can be created.
- A minimal Java Swing app can run in-browser.
- The real OpenRocket Swing app can be launched with the correct JAR and classpath.
- `.ork` files can be opened from a sample or upload path.
- Simulation and 3D/graph outputs are evaluated as a compatibility risk.

## Target version notes

This scaffold is intentionally versioned as a placeholder for the actual validation run:

- OpenRocket: upstream source reference only; actual commit is selected in the investigation phase.
- CheerpJ: 4.3 via `https://cjrtnc.leaningtech.com/4.3/loader.js`
- Java: JDK 17 or 21 depending on the final upstream target
- Browser: Chrome or Chromium based on the local testing environment

## Repository structure

```text
openrocket-cheerpj-swing-poc/
├─ README.md
├─ LICENSE-NOTICE.md
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ index.html
├─ public/
│  ├─ index.html
│  ├─ engine/
│  │  ├─ runtime-manifest.json
│  │  ├─ openrocket-app.jar (placeholder)
│  │  ├─ openrocket-core.jar (placeholder)
│  │  └─ dependencies/
│  │     ├─ dependency-01.jar (placeholder)
│  │     └─ dependency-02.jar (placeholder)
│  └─ samples/
│     ├─ small.ork
│     └─ medium.ork
├─ src/
│  ├─ main.ts
│  ├─ launcher.ts
│  ├─ diagnostics.ts
│  └─ styles.css
├─ scripts/
│  ├─ inspect-openrocket.sh
│  ├─ build-openrocket.sh
│  ├─ verify-assets.sh
│  ├─ compile-hello-swing.sh
│  └─ measure-performance.js
├─ reports/
│  ├─ investigation.md
│  ├─ compatibility.md
│  ├─ performance.md
│  └─ memory.md
├─ vendor/
│  ├─ openrocket-source-reference.txt
│  └─ HelloSwing.java
├─ .gitignore
└─ .npmrc (optional)
```

## Setup

```bash
cd openrocket-cheerpj-swing-poc
npm install
npm run dev -- --host 0.0.0.0 --port 8080
```

### GitHub Codespaces

Run the Vite server from the `openrocket-cheerpj-swing-poc` directory:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 8080
```

In the Codespaces **Ports** panel, find port `8080` and open it in the browser. Do not open
`index.html` as a local file and do not use the `public/` directory as the document root.
The browser page is served by Vite, while CheerpJ maps `/app/engine/openrocket-app.jar`
to the `public/engine/openrocket-app.jar` asset.

To verify the asset before launching:

```bash
curl -I http://127.0.0.1:8080/engine/openrocket-app.jar
```

The response must be `200 OK` and have `Content-Type: application/java-archive`.

For a static server, use the project root rather than `public/`:

```bash
npx http-server . -p 8080
```

Then browse to:

```text
http://localhost:8080/
```

## Verification checklist

- [ ] CheerpJ initialization succeeds
- [ ] Minimal Swing Hello World runs
- [ ] OpenRocket main class is identified correctly
- [ ] OpenRocket app JAR is located
- [ ] `.ork` sample can be opened
- [ ] Simulation executes in browser environment
- [ ] Graph and 3D display are evaluated
- [ ] Memory and startup timing are measured
- [ ] Decision is made with evidence, not assumption

## Known limitations

- This is not an official OpenRocket build.
- The actual OpenRocket distribution is not included here.
- JAR names and dependency layout must be replaced with the real generated artifacts during the research phase.
- Browser runtime differences can change compatibility results significantly.

## License notice

This project is an independent technical research scaffold for CheerpJ + Swing compatibility testing.

It does not represent the official OpenRocket project, nor does it bundle the upstream OpenRocket source or binaries as a release artifact.

For the actual upstream project and any third-party dependencies, see:

- OpenRocket project: https://github.com/openrocket/openrocket
- CheerpJ: https://cheerpj.com
- GNU GPLv3: https://www.gnu.org/licenses/gpl-3.0.html

See also `LICENSE-NOTICE.md` for a fuller legal notice.

## Summary

This project is designed to support the workflow described in the investigation memo:

1. Inspect upstream build outputs and launch class candidates.
2. Confirm the Java application starts locally.
3. Validate a Hello Swing app in CheerpJ.
4. Attempt to launch the OpenRocket Swing app in browser mode.
5. Evaluate `.ork` loading, simulation, graphing, and memory.
6. Make a recommendation based on evidence.

This scaffold intentionally avoids pretending the real OpenRocket app is already working in web mode.

```plaintext
This project is a non-official research prototype for evaluating OpenRocket Swing compatibility via CheerpJ.
OpenRocket is licensed under GNU GPLv3 and is not represented as an official product here.
```
