import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GlobalBackgroundMusic = ({ src, excludePath }) => {
  const audioRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!audioRef.current) return;

    // Logic: If current path is the excluded one, pause. Otherwise, play.
    if (location.pathname === excludePath) {
      audioRef.current.pause();
    } else {
      // Browsers may still block this until the first user click
      audioRef.current.play().catch(() => {
        console.log("Playback waiting for user interaction...");
      });
    }
  }, [location, excludePath]); // Re-run whenever the URL changes

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      style={{ display: 'none' }}
    />
  );
};

export default GlobalBackgroundMusic;