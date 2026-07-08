import ClockWidget from '../components/widgets/ClockWidget';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TickerWidget from '../components/widgets/TickerWidget';
import BrandWidget from '../components/widgets/BrandWidget';
import QuoteWidget from '../components/widgets/QuoteWidget';

interface WelcomeLayoutProps {
  brandName: string;
  slogan: string;
}

export default function WelcomeLayout({ brandName, slogan }: WelcomeLayoutProps) {
  return (
    <div className="aspect-video w-screen h-screen bg-white flex flex-col overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[320px] bg-slate-900 p-6 flex flex-col justify-start gap-6 h-full border-r border-slate-700">
          <ClockWidget />
          <div className="border-t border-white/15 w-full"></div>
          <WeatherWidget />
        </div>
        {/* Brand */}
        <div className="flex-1 flex items-center justify-center">
          <BrandWidget brandName={brandName} slogan={slogan} />
        </div>
      </div>
      {/* Bottom 1 */}
      <TickerWidget />
      {/* Bottom 2 */}
      <div className="h-24 bg-slate-900 flex">
        <div className="flex-1 flex items-center justify-around text-white p-4 text-sm">
        </div>
        <div className="w-1/3 border-l border-slate-700">
          <QuoteWidget />
        </div>
      </div>
    </div>
  );
}
