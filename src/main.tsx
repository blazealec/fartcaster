import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

// Force clear any cached resources
if (window.caches) {
  try {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  } catch (e) {
    console.error("Error clearing caches:", e);
  }
}

// Clear localStorage items that might be related to audio
try {
  // Keep highscore
  const highScore = localStorage.getItem('fartcaster-highscore');
  localStorage.clear();
  if (highScore) {
    localStorage.setItem('fartcaster-highscore', highScore);
  }
} catch (e) {
  console.error("Error clearing localStorage:", e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 