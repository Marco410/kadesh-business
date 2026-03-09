/**
 * Loads the Google Identity Services (GSI) script once and resolves when ready.
 * Uses NEXT_PUBLIC_GOOGLE_CLIENT_ID for the OAuth client ID.
 */
export interface GsiButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  width?: number;
  locale?: string;
  [key: string]: unknown;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
  }) => void;
  prompt: (
    momentListener?: (notification: { isDisplayed: () => boolean }) => void,
  ) => void;
  renderButton: (parent: HTMLElement, options: GsiButtonConfig) => void;
}

export function loadGoogleGsiScript(): Promise<{
  accounts: { id: GoogleAccountsId };
}> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google GSI only runs in the browser"));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(
      window.google as { accounts: { id: GoogleAccountsId } },
    );
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google as { accounts: { id: GoogleAccountsId } });
      } else {
        reject(new Error("Google GSI failed to load"));
      }
    };
    script.onerror = () =>
      reject(new Error("Failed to load Google GSI script"));
    document.head.appendChild(script);
  });
}
