# XxXxX

XxXxX is a small, polished text-chat MVP built with Expo and React Native. It runs on iOS, Android, and the web from the same codebase.

## Requirements

- Node.js 18 or newer
- npm
- Expo Go (for a physical iOS or Android device), or an emulator

## Install and run

```bash
npm install
npm start
```

Then press `w` for web, `a` for Android, or `i` for iOS in the Expo terminal. You can also use `npm run web`, `npm run android`, or `npm run ios`.

## Checks

```bash
npm run typecheck
npm run export:web
```

Conversations and messages are stored locally with AsyncStorage. The initial demo conversations are seeded automatically on first launch.
