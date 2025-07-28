import { useState } from "react";
import "./App.css";
import '@mantine/core/styles.css';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';

import Main from './pages/Main';
import SplashScreen from './components/SplashScreen';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'rng-toolbox-color-scheme',
});

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <MantineProvider colorSchemeManager={colorSchemeManager}
        defaultColorScheme="light">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && <Main />}
    </MantineProvider>
  );
}

export default App;
