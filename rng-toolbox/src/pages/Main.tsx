import { useState } from 'react';
import Navbar from '../components/Navbar';
import Collect from './Collect';
import Analyze from './Analyze';
import Applications from './Applications';

export default function Main() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <Collect />;
      case 1:
        return <Analyze />;
      case 2:
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
}
