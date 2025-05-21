// @ts-ignore
import React, { useEffect, useState, useRef, useCallback } from "react";
// @ts-ignore
import { sdk } from "@farcaster/frame-sdk";
import './index.css';

// Define different fart sound files - we now have real files
const FART_SOUNDS = [
  '/sounds/fart1.mp3',
  '/sounds/fart2.mp3',
  '/sounds/fart3.mp3',
  '/sounds/fart4.mp3',
  '/sounds/fart5.mp3',
];

function App() {
  const [fartCount, setFartCount] = useState(0);
  const [lastFartTime, setLastFartTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const appRef = useRef<HTMLDivElement>(null);

  // Create audio elements for each sound
  useEffect(() => {
    // Check if there's a saved high score
    const savedHighScore = localStorage.getItem('fartcaster-highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    // Setup audio
    audioRefs.current = FART_SOUNDS.map(() => new Audio());
    
    // Preload all sounds
    FART_SOUNDS.forEach((sound, index) => {
      if (audioRefs.current[index]) {
        audioRefs.current[index].src = sound;
        audioRefs.current[index].load();
      }
    });

    // Add event listener for touch events to prevent default behavior
    const preventDefaultForTouchEvents = (e: TouchEvent) => {
      // Prevent default behavior like scrolling
      if (e.target && (e.target as HTMLElement).closest('.fartcaster-app')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefaultForTouchEvents, { passive: false });
    document.addEventListener('touchmove', preventDefaultForTouchEvents, { passive: false });

    // Remove splash screen when app is ready
    sdk.actions.ready();
    
    return () => {
      // Clean up audio elements
      audioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      // Clean up event listeners
      document.removeEventListener('touchstart', preventDefaultForTouchEvents);
      document.removeEventListener('touchmove', preventDefaultForTouchEvents);
    };
  }, []);

  // Update high score when fart count increases
  useEffect(() => {
    if (fartCount > highScore) {
      setHighScore(fartCount);
      localStorage.setItem('fartcaster-highscore', fartCount.toString());
    }
  }, [fartCount, highScore]);

  const playRandomFart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Stop event propagation
    event.stopPropagation();
    
    const now = Date.now();
    const timeSinceLastFart = now - lastFartTime;
    
    // Prevent spam clicking (limit to one fart per 150ms)
    if (timeSinceLastFart < 150) return;
    
    // Get a random fart sound
    const randomIndex = Math.floor(Math.random() * FART_SOUNDS.length);
    const audio = audioRefs.current[randomIndex];
    
    if (audio) {
      // Reset the audio and play
      audio.currentTime = 0;
      audio.volume = 0.7 + (Math.random() * 0.3); // Slight volume variation
      audio.play().catch(err => console.error("Error playing sound:", err));
    }
    
    // Add haptic feedback if available (for mobile devices)
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Vibrate for 50ms
    }
    
    // Update state
    setFartCount(prev => prev + 1);
    setLastFartTime(now);
    setIsAnimating(true);
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  }, [lastFartTime]);

  const shareFartCount = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await sdk.actions.composeCast({
        text: `I just cast ${fartCount} farts on Fartcaster! Can you beat my score? 💨`,
        embeds: [`${window.location.origin}`]
      });
    } catch (error) {
      console.error('Error sharing fart count:', error);
    }
  };

  const resetCount = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFartCount(0);
  };

  return (
    <div 
      className="fartcaster-app" 
      ref={appRef}
      onClick={playRandomFart}
      onTouchStart={playRandomFart}
    >
      <header>
        <h1>Fartcaster</h1>
        <p className="tagline">The world's premier fart-casting platform</p>
      </header>

      <div className={`fart-button ${isAnimating ? 'animate' : ''}`}>
        <span className="emoji">💨</span>
      </div>

      <div className="fart-counter">
        <h2>{fartCount}</h2>
        <p>Farts Cast</p>
        {highScore > 0 && fartCount !== highScore && (
          <p className="high-score">High Score: {highScore}</p>
        )}
      </div>

      <div className="button-container">
        {fartCount > 0 && (
          <>
            <button className="share-button" onClick={shareFartCount}>
              Share My Farts
            </button>
            <button className="reset-button" onClick={resetCount}>
              Reset
            </button>
          </>
        )}
      </div>
      
      <footer>
        <p>Tap anywhere to cast a fart!</p>
      </footer>
    </div>
  );
}

export default App;
