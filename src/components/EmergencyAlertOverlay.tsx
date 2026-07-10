
interface EmergencyAlertOverlayProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyAlertOverlay({ message, isOpen, onClose }: EmergencyAlertOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/90 p-8 text-white">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-4">🚨 ALERTA DE EMERGENCIA 🚨</h2>
        <p className="text-4xl">{message}</p>
        <button 
            onClick={onClose}
            className="mt-8 px-6 py-3 bg-white text-red-600 font-bold rounded"
        >
            Cerrar Alerta
        </button>
      </div>
    </div>
  );
}
