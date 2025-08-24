// This file is not needed for Next.js routing
// Next.js handles routing through the app/ directory structure
// You can delete this file or keep it minimal for global providers

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default App;