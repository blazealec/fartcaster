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
  const appRef = useRef<HTMLDivElement>(null);

  // Create an audio context when needed
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      // @ts-ignore for older browsers
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

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
      
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
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

  // Play a simple fart sound using the Web Audio API
  const playFartSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      
      // Create an oscillator for a fart sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Random frequency between 40 and 100 Hz for fart-like sounds
      const baseFreq = Math.random() * 60 + 40;
      oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
      
      // Add a frequency sweep for a fart-like effect
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq / 2,
        audioContext.currentTime + 0.2 + Math.random() * 0.3
      );
      
      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2 + Math.random() * 0.3);
      
      // Start and stop
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Add a noise component for a more realistic fart
      const bufferSize = 4096;
      // @ts-ignore for older browsers
      const noiseNode = audioContext.createScriptProcessor ? 
        audioContext.createScriptProcessor(bufferSize, 1, 1) : 
        audioContext.createBufferSource();
        
      if ('onaudioprocess' in noiseNode) {
        noiseNode.onaudioprocess = function(e) {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
        };
        
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0, audioContext.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2 + Math.random() * 0.2);
        
        noiseNode.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        // Clean up noise node after sound finishes
        setTimeout(() => {
          noiseNode.disconnect();
        }, 500);
      }
      
      console.log("Playing fart sound with Web Audio API");
      
    } catch (error) {
      console.error("Error playing fart sound:", error);
    }
  }, [getAudioContext]);

  const playRandomFart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Stop event propagation
    event.stopPropagation();
    
    const now = Date.now();
    const timeSinceLastFart = now - lastFartTime;
    
    // Prevent spam clicking (limit to one fart per 150ms)
    if (timeSinceLastFart < 150) return;
    
    // Play a fart sound
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