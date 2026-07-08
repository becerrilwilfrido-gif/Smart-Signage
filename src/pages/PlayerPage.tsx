import { useParams } from 'react-router-dom';
import WelcomeLayout from '../layouts/WelcomeLayout';
import { useState } from 'react';

export default function PlayerPage() {
  const { screenId } = useParams();
  const [started, setStarted] = useState(false);

  const startFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().then(() => setStarted(true)).catch((err) => {
        console.error(err);
        setStarted(true); // Proceed anyway if fullscreen fails
      });
    } else {
      setStarted(true);
    }
  };

  // Mock Firestore data
  const screenData = { brandName: "Smart Support", slogan: "Soluciones Inteligentes para tu Empresa" };

  if (!started) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">
        <button 
          onClick={startFullscreen}
          className="px-8 py-4 bg-blue-600 rounded-lg text-2xl font-bold hover:bg-blue-500"
        >
          Iniciar Pantalla (Screen: {screenId})
        </button>
      </div>
    );
  }

  return <WelcomeLayout {...screenData} />;
}
