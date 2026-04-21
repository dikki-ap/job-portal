import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:9090',
  realm: 'job-portal',
  clientId: 'job-portal-web',
});

let _initPromise: Promise<boolean> | null = null;

export function initKeycloak(): Promise<boolean> {
  if (!_initPromise) {
    _initPromise = keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    });
  }
  return _initPromise;
}

export default keycloak;
