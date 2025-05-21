# Fartcaster 💨

The world's premier fart-casting platform on the Farcaster network!

## About

Fartcaster is a fun and interactive Farcaster mini app that lets users:

- Tap to create authentic fart sounds
- Count the number of "farts cast"
- Share their accomplishments with friends on Farcaster

## Features

- Beautiful UI with smooth animations
- Multiple randomized fart sounds
- Counter to track your fart-casting accomplishments
- Easy sharing to Farcaster
- Responsive design for all devices

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/fartcaster.git
   cd fartcaster
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser to http://localhost:5173

### Sound Files

The app uses placeholder sound files located in `public/sounds/`. Replace these with actual fart sound files for the best experience:

- fart1.mp3
- fart2.mp3
- fart3.mp3
- fart4.mp3
- fart5.mp3

### Images

Replace the placeholder images in `public/images/` with your own:

- logo.png - App icon (200x200px recommended)
- share-image.png - Image for sharing in Farcaster (3:2 aspect ratio)
- hero.png - Hero image for app store listings
- og.png - Open Graph image for social sharing

## Deployment

1. Build the app for production
   ```
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your hosting provider

3. Set up the domain and update the URLs in:
   - `index.html` (fc:frame meta tag)
   - `public/.well-known/farcaster.json`

## Publishing on Farcaster

To publish your app on Farcaster:

1. Host the app on your domain (e.g., fartcaster.example.com)
2. Ensure the `.well-known/farcaster.json` file is accessible
3. Use the [Mini App Manifest Tool](https://warpcast.com/~/developers/new) in Warpcast to generate the `accountAssociation` property
4. Add the generated association to your `farcaster.json` file

## Contributing

Contributions are welcome! Feel free to submit a PR or open an issue.

## License

MIT License

---

Created with 💨 by [Your Name] 