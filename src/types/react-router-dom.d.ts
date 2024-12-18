declare module 'react-router-dom' {
  import * as React from 'react';

  export interface RouteProps {
    path?: string;
    exact?: boolean;
    component?: React.ComponentType<any>;
    render?: (props: any) => React.ReactNode;
  }

  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string;
  }

  export const BrowserRouter: React.ComponentType<any>;
  export const HashRouter: React.ComponentType<any>;
  export const Route: React.ComponentType<RouteProps>;
  export const Link: React.ComponentType<LinkProps>;
  export const Switch: React.ComponentType<any>;
  export const useLocation: () => { pathname: string };
  export const useHistory: () => { push: (path: string) => void };
  export const useParams: <T extends Record<string, string | undefined>>() => T;
}

