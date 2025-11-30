import React, { useState } from 'react';
import { ThemeType } from './types';
import RoyalClassicTheme from './components/RoyalClassicTheme';
import EditorialClassicTheme from './components/EditorialClassicTheme';
import NocturneTheme from './components/NocturneTheme';
import StudioTheme from './components/StudioTheme';
import StageTheme from './components/StageTheme';
import NatureTheme from './components/NatureTheme';
import LandingView from './components/LandingView'; // New component
import { ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  // Default to 'analysis' which we will reuse as the Landing View state or create a new 'landing' state.
  // Let's use 'landing' as the default state string for clarity.
  const [currentTheme, setCurrentTheme] = useState<ThemeType | 'landing'>('landing');

  const renderTheme = () => {
    switch (currentTheme) {
      case 'royal':
        return <RoyalClassicTheme />;
      case 'editorial':
        return <EditorialClassicTheme />;
      case 'nocturne':
        return <NocturneTheme />;
      case 'studio':
        return <StudioTheme />;
      case 'stage':
        return <StageTheme />;
      case 'nature':
        return <NatureTheme />;
      case 'landing':
      default:
        return <LandingView onSelect={setCurrentTheme} />;
    }
  };

  return (
    <div>
      {/* Floating Back Button - Only visible when not on landing page */}
      {currentTheme !== 'landing' && (
        <button 
          onClick={() => setCurrentTheme('landing')}
          className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur text-slate-800 px-4 py-3 rounded-full shadow-2xl border border-slate-200 flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-all duration-300 font-sans text-sm font-bold"
        >
          <ArrowLeft size={16} />
          一覧に戻る
        </button>
      )}

      {/* Main Content Area */}
      <div className="relative">
        {renderTheme()}
      </div>
    </div>
  );
};

export default App;