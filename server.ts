import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mock announcement data
  const announcements = [
    "Bienvenidos a nuestras instalaciones. Por favor, mantenga su gafete visible.",
    "Recordatorio: La capacitación de seguridad será el día de mañana a las 10:00 AM.",
    "Aviso: El servicio de cafetería estará cerrado por mantenimiento el próximo viernes.",
    "Noticia importante: Nuevo proceso de entrada a partir del lunes."
  ];

  // API route for ticker
  app.get("/api/ticker", (req, res) => {
    res.json({ announcements });
  });

  // API route for quote
  app.get("/api/quote", async (req, res) => {
    const quotes = [
      { text: "La innovación distingue a los líderes de los seguidores.", author: "Steve Jobs" },
      { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
      { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
      { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" }
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json(quotes[randomIndex]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
