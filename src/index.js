import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Test } from './utils/Test';

const root = createRoot(document.getElementById("root"));

Test();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);