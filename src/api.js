import axios from 'axios';
import Settings from './settings';
import {showError} from './helpers';
import token from './token';

const headers = () => ({headers: {Authorization: `Bearer ${token.get()}`}});

export default {
  bet (chance, betAmount, target, currency) {
    return axios.post(`${Settings.ApiBase}api/dice/bet`, {
      appId: Settings.AppId,
      chance,
      betAmount,
      target,
      currency
    }, headers()).catch(showError);
  },
  logout () {
    return axios.post(`${Settings.ApiBase}api/logout`, {appId: Settings.AppId}, headers());
  },
  getBalance (currency) {
    return axios.get(`${Settings.ApiBase}api/account/balance?currency=${currency}&appId=${Settings.AppId}`, headers());
  },
  getDiceSeed (clientSeed) {
    return axios.get(`${Settings.ApiBase}api/dice/getseed?appId=${Settings.AppId}&clientSeed=${clientSeed}`, headers());
  },
  saveClientSeed (clientSeed) {
    return axios.post(`${Settings.ApiBase}api/dice/saveClientSeed`, {
      appId: Settings.AppId,
      clientSeed
    }, headers()).catch(showError);
  },
  generateNewServerSeed (clientSeed) {
    return axios.post(`${Settings.ApiBase}api/dice/generateNewServerSeed`, {
      appId: Settings.AppId,
      clientSeed
    }, headers()).catch(showError);
  },
  getStats (currency) {
    return axios.get(`${Settings.ApiBase}api/stats/getstats?currency=${currency}&appId=${Settings.AppId}`);
  },
  getUserStats (userName) {
    return axios.get(`${Settings.ApiBase}api/stats/getuserstats?appId=${Settings.AppId}&userName=${userName}`);
  },
  loadState (currency, clientSeed) {
    return axios.get(`${Settings.ApiBase}api/app/loadstate?currency=${currency}&appId=${Settings.AppId}&clientSeed=${clientSeed}`, token.isNotDefined() ? {} : headers());
  }
};
