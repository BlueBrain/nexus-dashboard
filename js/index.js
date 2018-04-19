import svgify from './libs/svg';
import Login from './login';

import cube from '../img/cube.svg';
import compass from '../img/compass.svg';

const icons = {
  cube,
  compass
}
const $ = sel => document.querySelector(sel);

const config = require('../config');
const baseURI = window.BASE_URI && !window.BASE_URI.startsWith('${') ? window.BASE_URI : "https://bbp-nexus.epfl.ch/staging";
const apiPath = `${baseURI}/v0`;


const user = new Login($('#login'));
const access_token = user.token;

if (config.name) {
  $('#instance-name').textContent = config.name;
  $('title').textContent = config.name;
}

const appLinks = $('#app-links');
if (config.apps.length === 0) {
  appLinks.style.display = 'none';
} else {
  let htmlStr;
  config.apps.forEach(app => {
    htmlStr = `
      <a href="${app.url}" id="${app.name}">
        <img class="svg" width="64" src="${icons[app.icon] || cube }" alt="${app.name}">
        <span>${app.name}</span>
      </a>
    `;
    appLinks.innerHTML += htmlStr;
  });
}

svgify();

const kgStatus = $('#kg .value');
const iamStatus = $('#iam .status');

const okStatus  = '<span>up</span> <i class="fa fa-check"></i>';
const nokStatus  = '<span>down</span> <i class="fa fa-times"></i>';

const fetchWithAuth = path => {
  const requestOptions = access_token
  ? { headers: { "Authorization": "Bearer "+ access_token } }
  : {};
  return fetch(apiPath + path, requestOptions)
}

fetchWithAuth('/data')
.then(response => {
  if (response.ok) {
    kgStatus.classList = 'value status ok';
    kgStatus.innerHTML = okStatus;
  } else {
    kgStatus.classList = 'value status error';
    kgStatus.innerHTML = nokStatus;
  }

  return response.json();
})
.then(({ total }) => {
  if (!isFinite(total)){ throw new Error('no total in repsonse'); }
  $('.instances .value').innerHTML = total;
  $('.instances .value').classList = 'value';
})
.catch(() => {
  $('.instances .value').innerHTML = 'Failed to fetch';
  $('.instances .value').classList = 'value error';
  kgStatus.classList = 'value status error';
  kgStatus.innerHTML = nokStatus;
});

fetchWithAuth('/schemas')
.then(response => response.json())
.then(({ total }) => {
  if (!total){ throw new Error('no total in response'); }
  $('.schemas .value').innerHTML = total;
  $('.schemas .value').classList = 'value';
})
.catch(() => {
  $('.schemas .value').innerHTML = 'Failed to fetch';
  $('.schemas .value').classList = 'value error';
});


fetchWithAuth('/domains')
.then(response => response.json())
.then(({ total }) => {
  if (!total){ throw new Error('no total in response'); }
  $('.domains .value').innerHTML = total;
  $('.domains .value').classList = 'value';
})
.catch(() => {
  $('.domains .value').innerHTML = 'Failed to fetch';
  $('.domains .value').classList = 'value error';
});

fetchWithAuth('/organizations')
.then(response => response.json())
.then(({ total }) => {
  if (!total){ throw new Error('no total in response'); }
  $('.organizations .value').innerHTML = total;
  $('.organizations .value').classList = 'value';
})
.catch(() => {
  $('.organizations .value').innerHTML = 'Failed to fetch';
  $('.organizations .value').classList.add('error');
  $('.organizations .value').classList = 'value error';
});

fetch(`${apiPath}/acls/health`)
.then(({ ok }) => {
  if (ok) {
    iamStatus.classList = 'value status ok';
    iamStatus.innerHTML = okStatus;
  } else {
    iamStatus.classList = 'value status error';
    iamStatus.innerHTML = nokStatus;
  }
})
.catch(() => {
  iamStatus.classList = 'value status error';
  iamStatus.innerHTML = nokStatus;
});

const configButton = $('a.config');
const configBlock = $('section.config');
const overlay = $('.overlay');
configButton.addEventListener('click', popuptoggle, false);

configBlock.querySelector('[name=name]').value = config.name;
configBlock.querySelector('[name=email]').value = config.email;
configBlock.querySelector('[name=scope]').value = config.scope;
function popuptoggle() {
  overlay.style.display = 'block';
  configBlock.classList.add('opened');
  configButton.classList.add('active');
}

document.addEventListener('click', handleClick, true);

function handleClick({target}) {
  if (configBlock.classList.contains('opened') && target.closest('section.config') === null) {
    configBlock.classList.remove('opened');
    overlay.style.display = 'none';
    configButton.classList.remove('active');
  }
}
