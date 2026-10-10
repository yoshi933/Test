# Memory note

This repository intentionally avoids claiming that the real OpenRocket Swing app is memory-safe in the browser.

The future measurement pass should record:
- browser tab memory after page load
- memory after CheerpJ init
- memory after Java app launch
- memory after sample `.ork` import
- memory after simulation
- memory after graph or 3D content updates

A browser-based Swing app can be technically runnable yet still fail real-world viability if memory use is excessive or increases continuously during workflow changes.
