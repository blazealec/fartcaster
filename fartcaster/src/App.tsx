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
  const [leaderboard, setLeaderboard] = useState<{fid:number; total:number}[]>([]);
  const fidRef = useRef<number | null>(null);

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

      const duration = Math.random() * 0.6 + 0.4; // 0.4 - 1.0s for richer sound
      const baseFreq = 40 + Math.random() * 40; // 40 - 80Hz rumble
      const now = ctx.currentTime;

      // --- Low-frequency rumble oscillator ---
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = baseFreq;

      const rumbleGain = ctx.createGain();
      osc.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);

      // Envelope for rumble
      rumbleGain.gain.setValueAtTime(0, now);
      rumbleGain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Gentle drop in frequency for comedic effect
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.6, now + duration);

      // --- Noisy component for 'wetness' ---
      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Brown-ish noise for deeper sound
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 200 + Math.random() * 300; // 200-500 Hz
      noiseFilter.Q.value = 0.7;

      const noiseGain = ctx.createGain();

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // Envelope for noise
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.8, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Start/stop sources
      osc.start(now);
      osc.stop(now + duration);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

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
    if(fidRef.current){
      fetch('/api/leaderboard', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({fid: fidRef.current, increment:1})
      }).then(()=>{
        // refresh leaderboard lightly
        fetch('/api/leaderboard')
           .then(r=>r.json())
           .then(d=>{if(d.leaderboard) setLeaderboard(d.leaderboard);});
      }).catch(()=>{});
    }
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

  // after SDK ready, capture fid and fetch leaderboard
  useEffect(() => {
    // @ts-ignore – Farcaster SDK context typing
    const userFid = sdk.context?.user?.fid;
    if (userFid) {
      fidRef.current = userFid;
    }

    // fetch leaderboard
    fetch('/api/leaderboard')
      .then(r=>r.json())
      .then(data=>{ if(data.leaderboard) setLeaderboard(data.leaderboard); })
      .catch(()=>{});
  }, []);

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
      
      {leaderboard.length>0 && (
        <div className="leaderboard">
          <h3>Daily Fartboard</h3>
          <ol>
            {leaderboard.map((row,idx)=>(
              <li key={row.fid}>
                #{idx+1} – fid {row.fid}: {row.total}
              </li>
            ))}
          </ol>
        </div>
      )}
       
      <footer>
        <p>Tap anywhere to cast a fart!</p>
      </footer>
    </div>
  );
}

export default App;
