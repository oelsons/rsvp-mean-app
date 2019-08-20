import { ENV } from './../core/env.config';

interface AuthConfig {
    CLIENT_ID: string;
    CLIENT_DOMAIN: string;
    AUDIENCE: string;
    REDIRECT: string;
    SCOPE: string;
};

export const AUTH_CONFIG: AuthConfig = {
    CLIENT_ID: 'Khb6l9i8pFX8w4OTnJj7ubWH2tdhXKxT',
    CLIENT_DOMAIN: 'dev-oel.auth0.com', // e.g., you.auth0.com
    AUDIENCE: 'audience', // e.g., http://localhost:8083/api/
    REDIRECT: `${ENV.BASE_URI}/callback`,
    SCOPE: 'openid profile'
};