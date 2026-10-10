# Compatibility decision

This project is suitable as a verification scaffold, not as a production OpenRocket browser implementation.

Recommended decision path:
- If the browser runtime starts, displays the Swing window, and loads sample `.ork` data without fatal exceptions, it is a valid technical demo and compatibility checkpoint.
- If runtime performance, file access, or 3D rendering fails, treat the browser path as a research-only experiment and continue with the desktop or React + core path.

The project should not be used to claim official support for OpenRocket in a browser until the upstream build, runtime, memory, and simulation behavior are verified in a real environment.
