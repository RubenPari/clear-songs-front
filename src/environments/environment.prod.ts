import { environmentAuto } from './environment.auto';

export const environment = {
  production: true,
  apiUrl: environmentAuto.apiUrl,
  spotifyClientId: environmentAuto.spotifyClientId,
  spotifyRedirectUri: environmentAuto.spotifyRedirectUri,
};
