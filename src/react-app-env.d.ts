/// <reference types="react" />
/// <reference types="react-dom" />

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '@farcaster/frame-sdk' {
  export const sdk: {
    actions: {
      ready: (options?: { disableNativeGestures?: boolean }) => Promise<void>;
      composeCast: (options: { 
        text?: string; 
        embeds?: string[]; 
        parent?: { type: 'cast'; hash: string };
        close?: boolean;
      }) => Promise<any>;
      close: () => Promise<void>;
      signIn: (options: { nonce: string; acceptAuthAddress?: boolean }) => Promise<{ signature: string; message: string }>;
      addMiniApp: () => Promise<void>;
      openUrl: (url: string) => Promise<void>;
      viewProfile: (options: { fid: number }) => Promise<void>;
    };
    context: {
      user: {
        fid: number;
        username?: string;
        displayName?: string;
        pfpUrl?: string;
      };
      location?: {
        type: string;
        [key: string]: any;
      };
      client: {
        clientFid: number;
        added: boolean;
        safeAreaInsets?: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
        notificationDetails?: {
          url: string;
          token: string;
        };
      };
    };
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    removeAllListeners: () => void;
  };
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
} 