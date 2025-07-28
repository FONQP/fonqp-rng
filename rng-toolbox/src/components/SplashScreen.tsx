import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const showDuration = 1500;
    const fadeDuration = 1000;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, fadeDuration);
    }, showDuration);

    return () => clearTimeout(fadeTimer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1s ease',
      }}
    >
      <img
        src="/rng-logo.png"
        alt="RNG Logo"
        style={{
          maxWidth: '60vw',
          maxHeight: '60vh',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
