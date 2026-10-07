import { useState, useEffect } from 'react';
import ClockWidget from '../components/widgets/ClockWidget';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TickerWidget from '../components/widgets/TickerWidget';
import BrandWidget from '../components/widgets/BrandWidget';
import InspirationWidget from '../components/widgets/InspirationWidget';
import CommuteWidget from '../components/widgets/CommuteWidget';
import EmergencyAlertOverlay from '../components/EmergencyAlertOverlay';

interface WelcomeLayoutProps {
  brandName: string;
  slogan: string;
}

function checkIsCommuteSchedule(): boolean {
  const now = new Date();
  const day = now.getDay(); // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes
  if (day < 1 || day > 5) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= (17 * 60 + 30) && minutes < (18 * 60 + 30); // 17:30 a 18:30 (5:30 PM a 6:30 PM)
}

export default function WelcomeLayout({ brandName, slogan }: WelcomeLayoutProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isCommuteActive, setIsCommuteActive] = useState<boolean>(checkIsCommuteSchedule);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsCommuteActive(prev => {
        const next = checkIsCommuteSchedule();
        return prev !== next ? next : prev;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'e' || event.key === 'E') {
        setIsAlertOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="aspect-video w-screen h-screen bg-white flex flex-col overflow-hidden">
      <EmergencyAlertOverlay 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)}
        message="¡Atención! Por favor, siga las instrucciones de seguridad."
      />
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[320px] bg-slate-900 p-6 flex flex-col items-center justify-start gap-6 h-full border-r border-slate-700">
          <ClockWidget />
          <div className="border-t border-white/15 w-full"></div>
          <WeatherWidget />
        </div>
        {/* Brand */}
        <div className="flex-1 relative h-full w-full overflow-hidden bg-white flex items-center justify-center">
          <BrandWidget brandName={brandName} slogan={slogan} />
        </div>
      </div>
      {/* Bottom 1 */}
      <TickerWidget />
      {/* Bottom 2 */}
      <div className="h-24 bg-slate-900 flex border-t border-slate-800">
        {isCommuteActive ? (
          <>
            <div className="flex-1 flex items-center h-full">
              <CommuteWidget />
            </div>
            <div className="w-1/3 border-l border-slate-700">
              <InspirationWidget />
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center h-full">
            <InspirationWidget />
          </div>
        )}
      </div>
    </div>
  );
}
