// Custom React type declarations
declare module 'react' {
  export = React;
  export as namespace React;
}

// Ensure TypeScript can find React
declare namespace React {
  interface Element {}
  
  // Re-export the memo function
  export function memo<T extends React.ComponentType<any>>(
    Component: T,
    propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
  ): React.MemoExoticComponent<T>;
}