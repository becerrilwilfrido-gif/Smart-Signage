/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlayerPage from './pages/PlayerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/player/:screenId" element={<PlayerPage />} />
        <Route path="/" element={<Navigate to="/player/demo-recepcion" />} />
      </Routes>
    </BrowserRouter>
  );
}
