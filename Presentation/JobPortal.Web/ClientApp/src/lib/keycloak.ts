import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'http://localhost:9090',
  realm: 'job-portal',
  clientId: 'job-portal-web',
})

export default keycloak
