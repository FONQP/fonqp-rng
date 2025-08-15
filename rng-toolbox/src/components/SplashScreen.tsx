import { useEffect, useState } from 'react';
import { useMantineColorScheme } from '@mantine/core';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const showDuration = 800;
    const fadeDuration = 500;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, fadeDuration);
    }, showDuration);

    return () => clearTimeout(fadeTimer);
  }, [onFinish]);

  const bgColor =
    colorScheme === 'dark' ? 'var(--mantine-color-dark-5)' : 'white';

  const logoSrc =
    colorScheme === 'dark' ? '/rng-logo-dark.png' : '/rng-logo.png';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: bgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1s ease',
      }}
    >
      <img
        src={logoSrc}
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
