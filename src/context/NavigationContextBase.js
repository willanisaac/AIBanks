import { createContext, useContext } from 'react';

export const NavigationContext = createContext({
  direction: 0,
  getDirection: () => 0,
});

export function useNavigationDirection() {
  return useContext(NavigationContext);
}
