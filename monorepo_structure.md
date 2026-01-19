# HiFiHörnet Monorepo Structure

## 📁 Project Structure
```
hifihornet/
├── packages/
│   ├── shared/              # Delad kod
│   │   ├── types/           # TypeScript types
│   │   ├── api/             # API functions
│   │   ├── utils/           # Helper functions
│   │   └── constants/       # Konstanter
│   ├── web/                # React webb
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   ├── mobile/             # React Native
│   │   ├── src/
│   │   ├── ios/
│   │   ├── android/
│   │   └── package.json
│   └── docs/               # Dokumentation
├── apps/                   # Build outputs
│   ├── web-build/
│   └── mobile-build/
├── tools/                  # Build tools
├── package.json            # Root package.json
└── lerna.json             # Monorepo config
```

## 🔄 Workflow
1. 📝 Ändra i shared/ → påverkar båda
2. 📝 Ändra i web/ → påverkar bara webb
3. 📝 Ändra i mobile/ → påverkar bara app
4. 🚀 Build & deploy → båda plattformar

## 🛠️ Tools
- 📦 Lerna/Nx → Monorepo management
- 🔄 TypeScript → Delade types
- 📦 ESDoc → Delade API functions
- 🚀 CI/CD → Automatisk deployment
