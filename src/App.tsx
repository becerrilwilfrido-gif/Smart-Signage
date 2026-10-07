/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlayerPage from './pages/PlayerPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/player/:screenId" element={<PlayerPage />} />
        <Route path="/" element={<Navigate to="/player/demo-recepcion" />} />
        <Route path="*" element={<Navigate to="/player/demo-recepcion" />} />
      </Routes>
    </HashRouter>
  );
}
