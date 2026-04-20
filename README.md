# Cozmic Wallpapers
An AI wallpaper generator app for mobile devices that specializes in generating outer-space-related images. This includes celestial bodies such as stars, galaxies, planets, and constellations. There are important instructions that the designated coding agent must follow written below.

## Context for Agent
This is a cross-platform React Native app that uses Expo's managed workflow and Typescript. To handle development builds, we will use EAS and its CLI tool to provision separate builds for Android and iOS. The respective Google Service files will be inside the project before you begin (NOTE: these two files are NOT tracked by git).
For the backend server, we will be using a managed architecture with Firebase. A file containing the app's config object will already be provided.
  
Please adhere to the following directory structure template when you are creating new subdirectories and files inside src/...
- src/app (this contains the UI for routes and route groups of the app)
- src/components (any components that you reuse or modularize are to be placed under this directory)
- src/types (any custom types you define with *.d.ts)
- src/constants (constant values that you use throughout the app such as color themes)
- src/hooks (any custom hooks you define)
- src/utils (utility functions you define)
- src/contexts (React Contexts that you may find useful to add)