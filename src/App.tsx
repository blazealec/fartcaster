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
  const appRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  // Initialize the app
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

    // This function finds and removes any rogue audio elements 
    // that might be trying to load the old base64 audio
    const cleanupRogueAudio = () => {
      // Find all audio elements in the document
      const audioElements = document.querySelectorAll('audio');
      
      // Remove them
      audioElements.forEach(audio => {
        console.log('Removing rogue audio element', audio);
        audio.remove();
      });
      
      // Also clear any audio-related references in window
      // @ts-ignore
      if (window._audioElements) {
        // @ts-ignore
        delete window._audioElements;
      }
    };

    // Run the cleanup immediately and periodically
    cleanupRogueAudio();
    const cleanupInterval = setInterval(cleanupRogueAudio, 1000);

    document.addEventListener('touchstart', preventDefaultForTouchEvents, { passive: false });
    document.addEventListener('touchmove', preventDefaultForTouchEvents, { passive: false });

    // Let the SDK know we're ready to show the app
    sdk.actions.ready();
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('touchstart', preventDefaultForTouchEvents);
      document.removeEventListener('touchmove', preventDefaultForTouchEvents);
      
      // Clean up interval
      clearInterval(cleanupInterval);
      
      // Close the audio context if it was created
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update high score when fart count increases
  useEffect(() => {
    if (fartCount > highScore) {
      setHighScore(fartCount);
      localStorage.setItem('fartcaster-highscore', fartCount.toString());
    }
  }, [fartCount, highScore]);

  // Create a fart sound using Web Audio API
  const playFartSound = useCallback(() => {
    // Prevent multiple sounds from playing simultaneously
    if (isPlayingRef.current) return;
    
    try {
      // Initialize AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        try {
          // @ts-ignore for older browsers
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();
        } catch (error) {
          console.error("Failed to create AudioContext:", error);
          return;
        }
      }
      
      const ctx = audioContextRef.current;
      isPlayingRef.current = true;
      
      // Random values for variety
      const duration = Math.random() * 0.3 + 0.2; // 0.2-0.5 seconds
      const baseFreq = Math.random() * 50 + 50; // 50-100 Hz
      const now = ctx.currentTime;
      
      // Create oscillator and gain nodes
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Configure oscillator
      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      
      // Connect the audio graph
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Set up the envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      // Add frequency modulation for more realistic fart sound
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + duration);
      
      // Start and stop the oscillator
      osc.start(now);
      osc.stop(now + duration);
      
      // Reset isPlaying flag after the sound is done
      setTimeout(() => {
        isPlayingRef.current = false;
      }, duration * 1000 + 50);
      
      console.log("Playing fart sound with Web Audio API");
    } catch (error) {
      console.error("Error playing fart sound:", error);
      isPlayingRef.current = false;
    }
  }, []);

  const playRandomFart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Stop event propagation
    event.stopPropagation();
    
    const now = Date.now();
    const timeSinceLastFart = now - lastFartTime;
    
    // Prevent spam clicking (limit to one fart per 150ms)
    if (timeSinceLastFart < 150) return;
    
    // Play the fart sound
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