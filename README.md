# Fartcaster 💨

A Farcaster mini app that lets users tap the screen to make fart sounds and track their "farts cast" count.

## Features

- Tap to play random fart sounds
- Track your fart count with local storage
- Share your fart achievements on Farcaster
- Beautiful gradient UI with animations
- High score tracking

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/blazealec/fartcaster.git
cd fartcaster/fartcaster
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Deployment to Vercel

The easiest way to deploy Fartcaster is using Vercel:

1. Fork this repository
2. Connect to Vercel
3. Create a new project from the forked repository
4. Configure the build settings:
   - Framework: Vite
   - Root Directory: fartcaster
   - Build Command: npm run build
   - Output Directory: dist

## Publishing to Farcaster

To make your Fartcaster app available in Warpcast:

1. Deploy the app to Vercel or your hosting provider
2. Update the `farcaster.json` file in `public/.well-known/` with your domain and information
3. Create account association using the Warpcast Mini App Manifest Tool
4. Add the association to your farcaster.json file
5. Test your app using the Warpcast Mini App Debug Tool

## Sound Credits

The app includes 5 high-quality fart sound effects.

## License

MIT 