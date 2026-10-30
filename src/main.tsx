import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useSimulationStore } from './stores/simulationStore';

import { FirebaseProvider } from './context/FirebaseContext.tsx';

if (import.meta.env.DEV) {
  (window as any).useSimulationStore = useSimulationStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </StrictMode>,
);
