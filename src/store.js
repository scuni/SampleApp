import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';
import 'ms-signalr-client';
import toastr from 'toastr';
import * as types from './mutation-types';
import api from './api';
import hub from './hub';
import Settings from './settings';
import {addToBetsList, createBet} from './bets-helpers';
import {currencies} from './currencies';
import {showError} from './helpers';
import token from './token';
import {bus} from './bus';

Vue.use(Vuex);

const state = {
  Balance: 0,
  Currency: 0,
  UserName: '',
  IsAuthenticated: false,
  WaitingOnBetResult: false,
  // dialogs
  ProvablyFairDialogVisible: false,
  RegisterDialogVisible: false,
  // stats
  NumBets: 0,
  MaxWin: 0,
  Bankroll: 0,
  Wagered: 0,
  Profit: 0,
  UserStats: [],
  // seed data
  ServerSeedHash: '',
  ClientSeed: '',
  Nonce: 0,
  PreviousSeed: '',
  PreviousSeedHash: '',
  PreviousClientSeed: '',
  PreviousNonce: '',
  LatestBets: [],
  HighrollerBets: [],
  UserBets: [],
  Signalr: null,
  ChatMessages: {}
};

const mutations = {
  [types.SET_REGISTER_DIALOG] (state, value) {
    state.RegisterDialogVisible = value;
  },
  [types.SET_PROVABLY_FAIR_DIALOG] (state, value) {
    state.ProvablyFairDialogVisible = value;
  },
  [types.RESET_USER] (state) {
    state.UserName = '';
    state.IsAuthenticated = false;
    state.Balance = 0;
  },
  [types.SET_USERNAME] (state, userName) {
    state.UserName = userName;
    state.IsAuthenticated = true;
  },
  [types.SET_CURRENCY] (state, currency) {
    state.Currency = currency;
  },
  [types.SET_BALANCE] (state, {Balance, Currency}) {
    if (state.Currency === Currency) {
      state.Balance = Balance;
    }
  },
  [types.SET_USERSTATS] (state, {stats}) {
    state.UserStats = stats;
  },
  [types.SET_STATS] (state, {Currency, NumBets, MaxWin, Bankroll, Wagered, Profit}) {
    if (state.Currency === Currency) {
      state.NumBets = NumBets;
      state.MaxWin = MaxWin;
      state.Bankroll = Bankroll;
      state.Wagered = Wagered;
      state.Profit = Profit;
    }
  },
  [types.SET_SEED] (state, {ServerSeedHash, ClientSeed, Nonce}) {
    state.ServerSeedHash = ServerSeedHash;
    state.ClientSeed = ClientSeed;
    state.Nonce = Nonce;
  },
  [types.SET_NONCE] (state, nonce) {
    state.Nonce = nonce;
  },
  [types.SET_WAITING_ON_BET_RESULT] (state, value) {
    state.WaitingOnBetResult = value;
  },
  [types.SET_BETS] (state, bets) {
    state.LatestBets.push(...bets.LatestBets.map(createBet).reverse());
    state.HighrollerBets.push(...bets.HighrollerBets.map(createBet).reverse());
    state.UserBets.push(...bets.UserBets.map(createBet).reverse());
  },
  [types.ADD_BET] (state, bet) {
    const formattedBet = createBet(bet);

    addToBetsList(formattedBet, state.LatestBets);

    if (formattedBet.BetAmount >= 0.1 || formattedBet.Profit >= 0.1) {
      addToBetsList(formattedBet, state.HighrollerBets);
    }

    if (formattedBet.Player === state.UserName) {
      addToBetsList(formattedBet, state.UserBets);
    }
  },
  [types.SET_NEW_DICE_SEED] (state, data) {
    state.ClientSeed = data.ClientSeed;
    state.ServerSeedHash = data.ServerSeedHash;
    state.PreviousSeed = data.PreviousSeed;
    state.PreviousSeedHash = data.PreviousSeedHash;
    state.PreviousClientSeed = data.PreviousClientSeed;
    state.PreviousNonce = data.PreviousNonce;
  },
  [types.SET_SIGNALR] (state, signalr) {
    state.Signalr = signalr;
  },
  [types.SET_CHAT_MESSAGES] (state, {Messages, AppId, Language}) {
    const key = `${AppId}-${Language}`;
    state.ChatMessages[key] = state.ChatMessages[key] || [];
    state.ChatMessages[key].push(...Messages);
  },
  [types.ADD_CHAT_MESSAGE] (state, {Message, AppId, Language}) {
    const key = `${AppId}-${Language}`;
    state.ChatMessages[key] = state.ChatMessages[key] || [];
    state.ChatMessages[key].push(Message);
  }
};

const actions = {
  changeCurrency ({commit}, currency) {
    commit(types.SET_CURRENCY, currency);

    api.getBalance(currency).then(function (response) {
      commit(types.SET_BALANCE, {Balance: response.data.Balance, Currency: currency});
    })
      .catch(showError);

    api.getStats(currency).then(function (response) {
      commit(types.SET_STATS, {Currency: currency, ...response.data});
    })
      .catch(showError);
  },
  showRegisterDialog ({commit}) {
    commit(types.SET_REGISTER_DIALOG, true);
  },
  hideRegisterDialog ({commit}) {
    commit(types.SET_REGISTER_DIALOG, false);
  },
  showProvablyFairDialog ({commit}) {
    commit(types.SET_PROVABLY_FAIR_DIALOG, true);
  },
  hideProvablyFairDialog ({commit}) {
    commit(types.SET_PROVABLY_FAIR_DIALOG, false);
  },
  logout ({commit, state}) {
    api.logout().then(() => {
      commit(types.RESET_USER);
      token.remove();
      hub.restart(state.Signalr);
    })
      .catch(showError);
  },
  saveClientSeed ({commit}, clientSeed) {
    api.saveClientSeed(clientSeed);
  },
  generateNewServerSeed ({commit}, clientSeed) {
    api.generateNewServerSeed(clientSeed);
  },
  login ({commit}, data) {
    commit(types.RESET_USER);
    token.remove();
    token.set(data.access_token, data.expires_in);
  },
  bet ({commit, state}, data) {
    commit(types.SET_WAITING_ON_BET_RESULT, true);
    api.bet(data.Chance, data.BetAmount, data.Target, state.Currency).then(() => {
      bus.$emit('new-bet');
    });
  },
  loadState ({commit, state}, clientSeed) {
    api.loadState(state.Currency, clientSeed).then(function (response) {
      const data = response.data;

      commit(types.SET_STATS, {Currency: state.Currency, ...data});

      if (data.UserName !== '') {
        commit(types.SET_USERNAME, data.UserName);
        commit(types.SET_BALANCE, {Balance: data.Balance, Currency: state.Currency});
        commit(types.SET_SEED, data);
        bus.$emit('user-connected');
      }

      commit(types.SET_BETS, data.Bets);
    })
      .catch(showError);
  },
  loadUserStats ({commit, state}) {
    api.getUserStats(state.UserName).then(function (response) {
      commit(types.SET_USERSTATS, {stats: response.data});
    })
      .catch(showError);
  },
  loadChatMessages ({commit}, {AppId, Language}) {
    api.loadChatMessages(AppId, Language)
      .catch(showError);
  },
  sendChatMessage ({commit}, {AppId, Language, Message}) {
    api.sendChatMessage(AppId, Language, Message)
      .catch(showError);
  },
  setupNotifications ({commit}) {
    const hubConnection = $.hubConnection(Settings.SocketUrl, {useDefaultPath: false});
    const socketHub = hubConnection.createHubProxy('socketHub');

    commit(types.SET_SIGNALR, {hubConnection, socketHub});

    hubConnection.error(function (error) {
      console.log(`SignalR error: ${error}`);
    });

    socketHub.on('showInfo', (message) => {
      toastr.info(message);
    });

    socketHub.on('showError', (message) => {
      toastr.error(message);
      commit(types.SET_WAITING_ON_BET_RESULT, false);
    });

    socketHub.on('diceBetResult', (balance, nonce, currency, appId) => {
      if (Settings.AppId === appId) {
        commit(types.SET_NONCE, nonce);
        commit(types.SET_BALANCE, {Balance: balance, Currency: currency});
        commit(types.SET_WAITING_ON_BET_RESULT, false);
      }
    });

    socketHub.on('showDiceBet', (userName, betAmount, chance, target, roll, profit, date, id, currency) => {
      commit(types.ADD_BET, {
        UserName: userName,
        BetAmount: betAmount,
        Chance: chance,
        Target: target,
        Roll: roll,
        Profit: profit,
        Date: date,
        Id: id,
        Currency: currency
      });
    });

    socketHub.on('newDiceSeedGenerated', (clientSeed, nonce, serverSeedHash, previousServerSeed, previousServerSeedHash, previousClientSeed, previousNonce, appId) => {
      if (Settings.AppId === appId) {
        commit(types.SET_NEW_DICE_SEED,
          {
            ClientSeed: clientSeed,
            Nonce: nonce,
            ServerSeedHash: serverSeedHash,
            PreviousSeed: previousServerSeed,
            PreviousSeedHash: previousServerSeedHash,
            PreviousClientSeed: previousClientSeed,
            PreviousNonce: previousNonce
          }
        );
      }
    });

    socketHub.on('newDeposit', (balance, amount, currency, appId) => {
      if (Settings.AppId === appId) {
        commit(types.SET_BALANCE, {Balance: balance, Currency: currency});
        toastr.info(`New deposit of ${amount} ${currencies[currency].code} received`);
      }
    });

    socketHub.on('updateStats', (currency, bankroll, maxWin, numBets, profit, wagered) => {
      commit(types.SET_STATS, {
        Currency: currency,
        NumBets: numBets,
        MaxWin: maxWin,
        Bankroll: bankroll,
        Wagered: wagered,
        Profit: profit
      });
    });

    socketHub.on('newChatMessage', (message, appId, language) => {
      commit(types.ADD_CHAT_MESSAGE, {
        Message: message,
        AppId: appId,
        Language: language
      });
    });

    socketHub.on('chatMessages', (messages, appId, language) => {
      commit(types.SET_CHAT_MESSAGES, {
        Messages: messages,
        AppId: appId,
        Language: language
      });
    });

    hub.start({hubConnection, socketHub});
  }
};

const getters = {
  HighrollerBets: state => state.HighrollerBets,
  UserBets: state => state.UserBets,
  LatestBets: state => state.LatestBets,
  AppName: state => Settings.AppName,
  Balance: state => state.Balance,
  Currency: state => state.Currency,
  NumBets: state => state.NumBets,
  MaxWin: state => state.MaxWin,
  Bankroll: state => state.Bankroll,
  Wagered: state => state.Wagered,
  Profit: state => state.Profit,
  UserName: state => state.UserName,
  UserStats: state => state.UserStats,
  IsAuthenticated: state => state.IsAuthenticated,
  RegisterDialogVisible: state => state.RegisterDialogVisible,
  ServerSeedHash: state => state.ServerSeedHash,
  ClientSeed: state => state.ClientSeed,
  Nonce: state => state.Nonce,
  PreviousSeed: state => state.PreviousSeed,
  PreviousSeedHash: state => state.PreviousSeedHash,
  PreviousClientSeed: state => state.PreviousClientSeed,
  PreviousNonce: state => state.PreviousNonce,
  WaitingOnBetResult: state => state.WaitingOnBetResult,
  ProvablyFairDialogVisible: state => state.ProvablyFairDialogVisible,
  ChatMessages: state => state.ChatMessages
};

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
});
