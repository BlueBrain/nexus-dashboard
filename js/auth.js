import { removeTokenFromUrl } from './libs/url';

export function login(location) {
  const token = removeTokenFromUrl(location);
  if (isAuthenticated()) {
    return;
  }
  if (token === undefined) {
    return;
  }
  const [, payload,] = token.split('.');
  try {
    // Go through URL decoding to properly parse UTF-8 data.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    const { name, exp } = JSON.parse(decodeURIComponent(escape(atob(payload))));
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('tokenOwner', name);
    sessionStorage.setItem('tokenExpiration', exp);
    window.location.replace(window.location.href);
  } catch (e) {
    console.error(e);
  }

}

export function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('tokenOwner');
  sessionStorage.removeItem('tokenExpiration');
  window.location.assign(window.location.href);
}

export function getToken() {
  return sessionStorage.getItem('token');
}

export function getTokenOwner() {
  return sessionStorage.getItem('tokenOwner');
}

export function isAuthenticated() {
  const now = Date.now() / 1000; //to get in seconds
  const tokenExpiration = sessionStorage.getItem('tokenExpiration');
  if (typeof tokenExpiration !== 'string') {
    return false;
  }
  if (now < tokenExpiration) {
    return true;
  }
  logout();
  return false;
}
