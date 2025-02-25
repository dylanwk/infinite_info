import { createContext, useContext, useState } from 'react';

type LayoutContextType = {
  drawerOpen: boolean;
  toggleDrawer: () => void;
};

const LayoutContext = createContext<LayoutContextType>({} as LayoutContextType);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <LayoutContext.Provider value={{ drawerOpen, toggleDrawer }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);