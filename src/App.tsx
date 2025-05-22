// @ts-ignore
import React, { useEffect, useState, useRef, useCallback } from "react";
// @ts-ignore
import { sdk } from "@farcaster/frame-sdk";
import './App.css';

// Simple audio implementation
const fartSounds = [
  new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAANABkAJwA0AEEATgBcAGkAcwB8AIIAiACMAI8AkQCRAI8AjQCJAIQAfgB3AHAAZwBfAFYATABDADkALwAlABwAEwAKAAEA+P/v/+f/3//X/9D/yv/E/77/uf+0/7D/rf+q/6j/p/+m/6b/p/+o/6r/rP+v/7L/tf+5/77/w//I/83/0//Y/97/5P/q//D/9v/8/wIACAAOABQAGgAfACUAKgAvADQAOAA9AEEARQBIAEsATgBQAFEAUwBUAFQAVQBVAFQAVABTAFIAUABPAE0ASwBIAEUAQgA/ADsANwAzAC8AKgAmACEAHAAYABMADgAJAAQA///6//X/8P/r/+b/4f/d/9j/1P/P/8v/x/+9/7n/tf+w/6z/qP+k/6D/nP+Y/5X/kf+O/4v/iP+F/4P/gf9//33/fP97/3r/ef95/3n/ef96/3v/fP99/37/gP+C/4T/hv+J/4v/jv+R/5T/l/+b/57/ov+m/6r/rv+y/7f/u/+//8T/yf/O/9P/2P/d/+L/5//s//H/9v/8/wEABgALABEAFgAbACAAJQAqAC8ANAA5AD4AQwBHAEwAUABUAFgAXABgAGQAaABrAG8AcgB1AHgAewB+AIAAggCEAIYAiACJAIsAjACNAI4AjwCPAJAAkACQAJAAkACQAI8AjgCOAI0AjACLAIoAiACHAIUAhACCAIAAfgB8AHoAeAB1AHMAbwBtAGoAZwBkAGEAXgBaAFcAUwBPAEwASABEAEAAPAA4ADQAMAAqACYAIgAeABoAFQARAA0ACAAEAAAAzADHAMIAvQC4ALMArgCqAKUAoACbAJYAkgCNAIgAhAB/AHoAdQBxAGwAZwBjAF4AWgBVAFEATABIAEMAPwA6ADYAMgAtACkAJQAhAB0AGQAVABEADQAJAAYAAgD+//v/9//0//H/7v/r/+j/5v/j/+H/3v/c/9r/2P/W/9T/0v/Q/87/zf/L/8r/yP/H/8b/xf/E/8P/wv/B/8H/wP/A/7//v/++/77/vv++/77/vv+//7//v/+//8D/wP/B/8L/w//E/8X/xv/H/8j/yf/L/8z/zv/P/9H/0//V/9f/2f/b/93/3//i/+T/5//p/+z/7//x//T/9//6//3/AAADAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAMAAYACQAM'),
  new Audio('data:audio/wav;base64,UklGRnFvT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAAOABcAJgAyAEAATQBaAGcAcgB+AIgAkQCaAKEApwCsALAAswC0ALQAswCwAK0AqACjAJ0AlgCOAIUAfAByAGgAXQBSAEcAPAAwACQAGAAMAAEA9f/p/97/0//I/73/sv+o/53/lP+L/4L/ev9z/2z/Zf9f/1r/Vf9R/03/Sv9I/0b/Rf9E/0T/RP9F/0b/R/9J/0v/Tf9Q/1P/V/9b/1//Y/9o/23/cv93/33/gv+I/47/lP+a/6D/pv+s/7L/uP++/8T/yv/Q/9b/3P/i/+j/7v/0//r/AAAGAAwAEgAYAB4AJAAqADAANgA8AEIASABOAFQAWgBgAGYAbAByAHgAfgCEAIoAkACWAJwAogCoAK4AtAC6AMAA'),
  new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAANABYAJAAyAD8ATQBZAGQAZABQADQALQBYAH0AiQCTAJsAoQCkAKEAnACVAI0AhAB8AHMAawBiAFkAUABHAD8ANwAvACgAIAAZABIACgADAPz/9f/u/+f/4P/a/9P/zf/H/8H/vP+3/7L/rv+q/6b/ov+f/5z/mf+X/5X/k/+S/5H/kP+Q/5D/kf+S/5P/lP+W/5j/mv+d/6D/o/+n/6r/rv+y/7b/u//A/8X/yv/P/9T/2v/f/+X/6v/w//b//P8CAAcADQATABkAHwAlACsAMQA2ADwAQQBHAEwAUQBWAFsAYABlAGoAbwBzAHgAfQCBAIUAiQCNAJEAlACYAJsAnwCiAKUAqACrAK0AsACyALQAtgC4ALoAvAC9AL4AwADBAMIAwwDEAMQAxQDFAMUAxQDFAMUAxADEAMMAWQBYAFcAVgBVAFMAUgBRAE8ATgBMAEsASQBIAEYARQBDAEEAQAA+ADwAOgA4ADYANAAyADAALgAsACoAKAAkACIAIAAdABoAFwAUABEADgALAAgABQACAAAA/f/6//f/9P/w/+3/6v/n/+T/4P/d/9r/1//U/9D/zf/K/8f/xP/A/73/uf+2/7P/sP+t/6n/pv+j/6D/nf+Z/5b/k/+Q/43/iv+H/4T/gf9+/3v/eP91/3L/b/9s/2n/Zv9j/2D/Xf9a/1j/Vf9S/0//TP9J/0b/RP9B/z7/Pf86/zf/NP8y/y//LP8q/yf/Jf8i/yD/Hv8c/xn/F/8V/xP/Ef8P/w3/C/8J/wf/Bf8D/wH/AP/+/vz++v74/vb+9f7z/vH+8P7u/u3+6/7q/uj+5/7m/uT+4/7i/uH+3/7e/t3+3P7b/tr+2f7Y/tf+1v7V/tT+1P7T/tL+0v7R/tH+0P7Q/s/+z/7P/s/+zv7O/s7+zv7O/s7+zv7O/s/+z/7P/s/+0P7Q/tH+0f7S/tL+0/7U/tT+1f7W/tf+1/7Y/tn+2v7b/tz+3f7e/t/+4P7i/uP+5P7l/ub+6P7p/ur+7P7t/u/+8P7y/vP+9f72/vj++f77/vz+/v4A/wH/A/8E/wb/CP8K/wv/Df8P/xH/E/8V/xf/Gf8b/x3/H/8h/yP/Jf8n/yn/K/8t/zD/Mv80/zb/OP86/zz/Pv9A/0P/Rf9H/0n/S/9N/1D/Uv9U/1b/WP9b/13/X/9h/2P/Zv9o/2r/bP9v/3H/c/91/3j/ev98/3//gf+D/4X/iP+K/4z/j/+R/5P/lf+Y/5r/nP+e/6H/o/+l/6j/qv+s/67/sf+z/7X/t/+6/7z/vv/A/8P/xf/H/8n/zP/O/9D/0v/V/9f/2f/b/93/4P/i/+T/5v/p/+v/7f/v//H/9P/2//j/+v/8/////wEAAwAFAAcACgAMAA4AEAASABQAFwAZABsAHQAfACEAIwAlACcAKQArAC0ALwAxADMANQA3ADkAOgA8AD4AQABCAEMARQBHAEgASgBMAE0ATwBQAFIAUwBVAFYAVwBZAFoAWwBdAF4AXwBg'),
  new Audio('data:audio/wav;base64,UklGRmtvT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAAMABYAJAAyAEAATPqPq7gGXMJdBVzPXMNcwFy9XLtcuVy4XLdctVy0XLJcsVyvXK5crFyrXKlcqFymXKVco1yiXKBcn1ydXJxcmlyZXJdcllyUXJNckVyQXI5cjVyLXIpciByHXIVchFyCXIFcf1x+XHxce1x5XHhcdlx1XHNcclwwHDEcMhwzHDQcNRw2HDccOBw5HDwcPRw/HEEcQhxFHEYcSBxLHEwcTxxRHFMcVhxXHFocXRxfHGIcZRxnHGocbRxwHHMcdRx4HHsefB59Hn4efx6AHoEegh6DHoQehR6GHoceiB6JHooeix6MHo0ejh6PHpAekR6SHpMelB6VHpYelx6YHpkemh6bHpwenR6eHp8eoB6hHqIeox6kHqUeph6nHqgeqB6mHqUepB6iHqEeoB6eHp0enB6aHpkemB6WHpUelB6SHpEekB6OHo0ejB6KHokeiB6GHoUehB6CHoEegB5+Hn0efB57Hnkebx5uHm0eax5qHmkeZh5lHmQeYx5hHmAeXx5dHlseWh5ZHlceVh5VHlMeUh5RHk8eTh5MHkseSR5IHkceRR5EHkMeQR5AHj8ePh48HjseSh1JHUgdRx1GHUUdRB1DHUIdQR1AHT8dPh09HTwdOx06HTkdOB03HTYdNR00HTMdMh0xHTAdsQCwAK8ArgCtAKwAqwCqAKkAqACnAKYApQCkAKMApwKmAqUCpAKjAqICgQKAAn8CfgJ9AnwC+wL6AvkC+AL3AvYCsAKvAq4CrQKsAqsCRQJEAkMCQgJBAkACnwKeAp0CnAKbApoCGAIXAhYCFQIUAhMCbQJsAmsCagJpAmgC/QH8AfsB+gH5AfgBkgGRAZABjwGOAY0BIQEgAR8BHgEdARwBtgC1ALQAswCyALEAKwAqACkAKAAnACYAAAD//wUC'),
  new Audio('data:audio/wav;base64,UklGRmtvT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAAKABMAIAAuADsASABWAGMAbQB6AIQAjgCXAJ8ApwCuALQAugC/AMMAyADLAM4A0ADSAMUA0wDUANYA1gDWANUA1ADTANEAzwDNAMsAyADFAMIAvwC7ALgAtACwAKwAqACkAKAAiwCHAH8AewB3AG8AawBnAGIAXgBaAFcAUwBQAE0ASgBGAEQAQQA+ADwAOgA4ADYANAAyADEALwAtACwAKgApACgAJwAlACQAIwAiACEAIAAfAB4AHQAcABsAGgAZABkAGAAXABYAFgAVABQAFAAUABMAEwASABIAEQASABEAEQAQABAADwAPAA8ADgAOAA4ADgANAA0ADgANAA0ADQANAAwADQAMAAwADAAMAAwACwALAAsACwALAAsACwAKAAoACgAKAAoACgAJAAkACQAJAAkACQAIAAgACAAIAAgACAAHAAcABwAHAAcABwAGAAYABgAGAAYABgAGAAUABQAFAAUABQAFAAQABAAEAAQABAAEAAQAAwADAAMAAwADAAMAAgACAAIAAgACAAIAAQABAAEAAQABAAEAAAAAAAAAAAAAAAAAAAAAAAAAAPf/9//3//f/9//3//b/9v/2//b/9v/2//X/9f/1//X/9f/1//T/9P/0//T/9P/0//P/8//z//P/8//z//L/8v/y//L/8v/y//H/8f/x//H/8f/x//D/8P/w//D/8P/w/+//7//v/+//7//v/+7/7v/u/+7/7v/u/+3/7f/t/+3/7f/t//L/8v/z//T/9f/1//b/9//4//n/+f/6//v//P/9//7//////wAAIAAhACIAIwAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGAAYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuAG8AcABxAHIAcwB0AHUAdgB3AHgAeQB6AHsAfAB9AH4AfwCAAIEAggCDAIQAhQCGAIcAiACJAIoAiwCMAI0AjgCPAJAAkQCSAJMAlACVAJYAlwCYAJkAmgCbAJwAnQCeAJ8AoAChAKIAowCkAKUApgCnAKgAqQCqAKsArACtAK4ArwCwALEAsgCzALQAtQC2ALcAuAC5ALoAuwC8AL0AvgC/AMAAwQDCAMMAyw==')
];

function App() {
  const [fartCount, setFartCount] = useState(0);
  const [lastFartTime, setLastFartTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const appRef = useRef<HTMLDivElement>(null);
  const audioInitialized = useRef(false);

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

    document.addEventListener('touchstart', preventDefaultForTouchEvents, { passive: false });
    document.addEventListener('touchmove', preventDefaultForTouchEvents, { passive: false });

    // Initialize audio on user interaction
    const initializeAudio = () => {
      if (!audioInitialized.current) {
        // Try to play a silent sound to initialize audio
        try {
          fartSounds.forEach(sound => {
            sound.volume = 0;
            sound.play().catch(() => {});
            sound.pause();
            sound.currentTime = 0;
          });
          audioInitialized.current = true;
        } catch (e) {
          console.log("Audio initialization failed, will try again on tap");
        }
      }
    };

    // Try to initialize audio with any user interaction
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('touchstart', initializeAudio, { once: true });

    // Let the SDK know we're ready to show the app
    sdk.actions.ready();
    
    return () => {
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
    const randomIndex = Math.floor(Math.random() * fartSounds.length);
    const sound = fartSounds[randomIndex];
    
    try {
      // Try to play the sound
      sound.volume = 0.7;
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error("Error playing sound:", error);
      });
      
      // Initialize audio if it hasn't been initialized yet
      audioInitialized.current = true;
    } catch (error) {
      console.error("Error playing fart sound:", error);
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