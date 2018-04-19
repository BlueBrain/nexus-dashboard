import { getToken, login, logout, isAuthenticated, getTokenOwner } from './auth';

const baseURI = window.BASE_URI && !window.BASE_URI.startsWith('${') ? window.BASE_URI : "https://bbp-nexus.epfl.ch/staging";
const loginURI = `${baseURI}/v0/oauth2/authorize?redirect=${location.href}`;

export default class Login {
  constructor (elm) {
    this.loginContainer = elm;
    login(window.location);
    if (isAuthenticated()) {
      elm.innerHTML = this.authenticatedBlock;
      elm.querySelector('a').addEventListener('click', this.logout.bind(this));
    } else {
      elm.innerHTML = this.loginBlock;
    }
  }

  logout () {
    logout();
  }

  get token () {
    return getToken();
  }

  get loginBlock ()  {
    return `<a href="${loginURI}">login</a>`;
  }

  get authenticatedBlock () {
    return `<a><span>${ getTokenOwner() }</span></a>`;
  }
}
