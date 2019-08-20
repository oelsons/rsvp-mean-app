import { Injectable } from '@angular/core';
import * as auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth.config';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ENV } from '../core/env.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });
  accessToken: string;
  userProfile: any;
  expiresAt: number;

  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
  loggingIn: boolean;

  constructor(private router : Router) {
    if(JSON.parse(localStorage.getItem('expires_at')) > Date.now()){
      this.renewToken();
    }
  }

  setLoggedIn(value: boolean){
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  login() {
    this._auth0.authorize();
  }

  handleAuth(){
    this._auth0.parseHash((err, authResult) => {
      if(authResult && authResult.accessToken){
        window.location.hash = '';
        this._getProfile(authResult);
      } else if (err) {
        console.error(`Error authenticating: ${err.error}`);
      }
      this.router.navigate(['/']);
    })
  }

  private _getProfile(authResult) {
    this.loggingIn = true;
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
      } else if (err) {
        console.warn(`Error retrieving profile: ${err.error}`);
      }
    });
  }

  private _setSession(authResult, profile?) {
    this.expiresAt = (authResult.expiresIn * 1000) + Date.now();

    localStorage.setItem('expires_at', JSON.stringify(this.expiresAt));
    this.accessToken = authResult.accessToken;
    this.userProfile = profile;

    this.setLoggedIn(true);
    this.loggingIn = false;
  }

  private _clearExpiration() {
    localStorage.removeItem('expires_at');
  }

  logout() {
    this._clearExpiration();

    this._auth0.logout({
      clientId: AUTH_CONFIG.CLIENT_ID,
      returnTo: ENV.BASE_URI
    })
  }

  get tokenValid(): boolean {
    return Date.now() < JSON.parse(localStorage.getItem('expires_at'));
  }

  renewToken() {
    this._auth0.checkSession({}, (err, authResult) => {
      if(authResult && authResult.accessToken) {
        this._getProfile(authResult);
      } else {
        this._clearExpiration();
      }
    });
  }
}
