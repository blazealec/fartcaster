// @ts-ignore
import React, { useEffect, useState, useRef, useCallback } from "react";
// @ts-ignore
import { sdk } from "@farcaster/frame-sdk";
import './App.css';

function App() {
  const [fartCount, setFartCount] = useState(0);
  const [lastFartTime, setLastFartTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Create and preload audio elements
  useEffect(() => {
    // Check if there's a saved high score
    const savedHighScore = localStorage.getItem('fartcaster-highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    // Add event listener for touch events to prevent default behavior
    const preventDefaultForTouchEvents = (e: TouchEvent) => {
      // Prevent default behavior like scrolling
      if (e.target && (e.target as HTMLElement).closest('.fartcaster-app')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefaultForTouchEvents, { passive: false });
    document.addEventListener('touchmove', preventDefaultForTouchEvents, { passive: false });

    // Let the SDK know we're ready to show the app
    sdk.actions.ready();
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('touchstart', preventDefaultForTouchEvents);
      document.removeEventListener('touchmove', preventDefaultForTouchEvents);
      // Close audio context if created
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Function to create fart sound using Web Audio API
  const playFartSound = useCallback(() => {
    if (isPlayingRef.current) return;

    try {
      if (!audioContextRef.current) {
        //@ts-ignore
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextCtor();
      }

      const ctx = audioContextRef.current;
      isPlayingRef.current = true;

      const duration = Math.random() * 0.3 + 0.2; // 0.2 - 0.5s
      const baseFreq = Math.random() * 50 + 50; // 50 - 100Hz
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = baseFreq;

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + duration);

      osc.start(now);
      osc.stop(now + duration);

      setTimeout(() => {
        isPlayingRef.current = false;
      }, duration * 1000 + 50);
    } catch (error) {
      console.error('Error playing fart sound:', error);
      isPlayingRef.current = false;
    }
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
    
    // Play fart sound using Web Audio
    playFartSound();
    
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
  }, [lastFartTime, playFartSound]);

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
