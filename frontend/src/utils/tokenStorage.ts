/**
 * Access token stored in a module-scoped variable (memory), not localStorage.
 * localStorage is readable by any JavaScript on the page — vulnerable to XSS.
 * Memory storage is wiped on page reload; the refresh cookie restores it.
 */

let _token: string | null = null;

export const tokenStorage = {
  get:   (): string | null => _token,
  set:   (t: string)       => { _token = t; },
  clear: ()                => { _token = null; },
};
