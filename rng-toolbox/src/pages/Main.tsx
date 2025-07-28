import { useState } from 'react';
import Navbar from '../components/Navbar';
import Collect from './Collect';
import Applications from './Applications';

export default function Main() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <h1>🏠 Home Content</h1>;
      case 1:
        return <Collect />;
      case 2:
        return <h1>🧪 Analyze Results</h1>;
      case 3:
        return <Applications />;
      default:
        return <h1>Not Found</h1>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Navbar activeIndex={activeIndex} onSectionChange={setActiveIndex} />
      <main
        style={{
          flex: 1,
          overflow: 'hidden', // Prevent scrollbars
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
}
