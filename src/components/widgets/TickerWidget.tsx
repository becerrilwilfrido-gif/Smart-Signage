export default function TickerWidget() {
  const text = "Bienvenido a BSD";

  return (
    <div className="w-full bg-blue-900 text-white py-6 overflow-hidden whitespace-nowrap border-t border-slate-700">
      <div className="animate-marquee inline-block min-w-full">
        <span className="text-3xl font-bold">{text}</span>
      </div>
    </div>
  );
}
