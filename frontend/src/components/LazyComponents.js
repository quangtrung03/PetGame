import { lazy } from 'react';

/**
 * Lazy loaded components for code splitting
 * This reduces initial bundle size by loading components only when needed
 */

// Main page components
export const Home = lazy(() => import('../pages/Home'));
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const Pets = lazy(() => import('../pages/Pets'));

// Auth components
export const Login = lazy(() => 
  import('../pages/Login').then(module => ({ default: module.default }))
);
export const Register = lazy(() => 
  import('../pages/Register').then(module => ({ default: module.default }))
);

// Feature components (loaded on demand)
export const Shop = lazy(() => 
  import('../pages/Shop').catch(() => ({ 
    default: () => <div>Shop feature coming soon!</div> 
  }))
);

export const MiniGames = lazy(() => 
  import('../pages/MiniGames').catch(() => ({ 
    default: () => <div>Mini games feature coming soon!</div> 
  }))
);

export const DailyMissions = lazy(() => 
  import('../pages/DailyMissions').catch(() => ({ 
    default: () => <div>Daily missions feature coming soon!</div> 
  }))
);

export const Friends = lazy(() => 
  import('../pages/Friends').catch(() => ({ 
    default: () => <div>Friends feature coming soon!</div> 
  }))
);

export const Help = lazy(() => 
  import('../pages/Help').catch(() => ({ 
    default: () => <div>Help feature loading...</div> 
  }))
);

// Component lazy loading with error handling
export const lazyWithRetry = (importFn, retries = 3) => {
  return lazy(() => 
    new Promise((resolve, reject) => {
      const attemptImport = (attempt = 1) => {
        importFn()
          .then(resolve)
          .catch(error => {
            if (attempt < retries) {
              console.warn(`Failed to load component, retrying... (${attempt}/${retries})`);
              setTimeout(() => attemptImport(attempt + 1), 1000 * attempt);
            } else {
              console.error('Failed to load component after retries:', error);
              reject(error);
            }
          });
      };
      attemptImport();
    })
  );
};

// Preload components for better UX
export const preloadComponent = (componentImport) => {
  if (typeof componentImport === 'function') {
    componentImport();
  }
};

// Preload critical components on app start
export const preloadCriticalComponents = () => {
  // Preload dashboard and pets as they're commonly accessed
  setTimeout(() => {
    preloadComponent(() => import('../pages/Dashboard'));
    preloadComponent(() => import('../pages/Pets'));
  }, 2000);
};

// Route-based code splitting configuration
export const routeComponents = {
  home: {
    component: Home,
    preload: true
  },
  dashboard: {
    component: Dashboard,
    preload: true
  },
  pets: {
    component: Pets,
    preload: true
  },
  login: {
    component: Login,
    preload: false
  },
  register: {
    component: Register,
    preload: false
  },
  shop: {
    component: Shop,
    preload: false
  },
  minigames: {
    component: MiniGames,
    preload: false
  },
  missions: {
    component: DailyMissions,
    preload: false
  },
  friends: {
    component: Friends,
    preload: false
  },
  help: {
    component: Help,
    preload: false
  }
};

export default {
  Home,
  Dashboard,
  Pets,
  Login,
  Register,
  Shop,
  MiniGames,
  DailyMissions,
  Friends,
  Help,
  lazyWithRetry,
  preloadComponent,
  preloadCriticalComponents,
  routeComponents
};
