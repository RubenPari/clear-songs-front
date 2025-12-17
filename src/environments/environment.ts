import { environmentAuto } from './environment.auto';

export const environment = {
  production: false,
  apiUrl: environmentAuto.apiUrl,
  spotifyClientId: environmentAuto.spotifyClientId,
  spotifyRedirectUri: environmentAuto.spotifyRedirectUri,
};
