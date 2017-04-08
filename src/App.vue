<template>
  <div id='app'>
    <RegisterDialog v-if='RegisterDialogVisible' @close='hideRegisterDialog'>
    </RegisterDialog>

    <NavBar>
    </NavBar>

    <div class='container'>
      <StatsBar>
      </StatsBar>

      <br/>

      <BetControls>
      </BetControls>

      <br/>
      <div class='row'>
        <div class='col-xs-12'>
          <ul id="mainTabs" class='nav nav-tabs' role="tablist">
            <li role="presentation" class='active mainTab'>
              <a id="highRollerButton" href='#BetsTab' v-on:click.prevent='highRollerButtonClicked'>Highroller</a>
            </li>
            <li role="presentation" class='mainTab'>
              <a id="allBetsButton" href='#BetsTab' v-on:click.prevent='allBetsButtonClicked'>All Bets</a>
            </li>
            <li role="presentation" class='mainTab'>
              <a id="myBetsButton" href='#BetsTab' v-on:click.prevent='myBetsButtonClicked'>My Bets</a>
            </li>
            <li role="presentation" class='mainTab'><a href='#ChatTab'>Chat</a></li>
            <li role="presentation" class='mainTab'><a href='#StatsTab' v-on:click.prevent='loadUserStats'>Stats</a>
            </li>
          </ul>

          <div class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="BetsTab">
              <BetsList v-bind:ActiveBets='ActiveBets'>
              </BetsList>
            </div>
            <div role="tabpanel" class="tab-pane" id="ChatTab"><Chat/></div>
            <div role="tabpanel" class="tab-pane" id="StatsTab">
              <UserStats>
              </UserStats>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "sass/site";

  #app {
    color: #FBFCFE;
    margin-top: 4px;
  }

  .form-control, .form-control[disabled] {
    background-color: #303E46;
    border-color: #303E46;
    color: #FBFCFE;
    text-align: right;
    font-size: 12px;
  }

  label {
    font-size: 12px;
    color: #878e92;
  }

  p {
    font-size: 12px;
    margin: 0;
  }

  a {
    color: #878e92;
  }

  /* iphone 6 landscape */
  @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (orientation: landscape) {
    table {
      font-size: 12px;
    }
  }

  /* iphone 6 plus landscape */
  @media only screen and (min-device-width: 414px) and (max-device-width: 736px) and (orientation: landscape) {
    table {
      font-size: 14px;
    }
  }

  /* ipad portrait */
  @media all and (device-width: 768px) and (device-height: 1024px) and (orientation: portrait) {
    p {
      font-size: 16px;
    }

    label {
      font-size: 16px;
    }

    .form-control, .form-control[disabled] {
      font-size: 16px;
    }

    .nav-tabs li a {
      font-size: 18px;
    }
  }

  /*ipad landscape */
  @media all and (device-width: 768px) and (device-height: 1024px) and (orientation: landscape) {
    p {
      font-size: 16px;
    }

    label {
      font-size: 16px;
    }

    .form-control, .form-control[disabled] {
      font-size: 16px;
    }

    .nav-tabs li a {
      font-size: 18px;
    }
  }

  /*ipad pro portrait and larger -- this seems to catch ipad lanscape? */
  @media only screen and (min-device-width: 1024px) {
    p {
      font-size: 14px;
    }

    label {
      font-size: 14px;
    }

    .form-control, .form-control[disabled] {
      font-size: 16px;
    }

    .nav-tabs li a {
      font-size: 18px;
    }
  }

  .nav-tabs {
    border: none;
  }

  .nav li a {
    padding: 4px 6px;
    border-radius: 0;
  }

  .nav-tabs li.active a {
    background-color: #1B262D;
    border: 0;
    color: #FBFCFE;
  }

  .btn-default {
    color: #FBFCFE;
    background-color: #303E46;
    border-color: #303E46;
  }

  .btn-primary {
    color: #FBFCFE;
    background: -webkit-linear-gradient(top, #FF2A68 13%, #8c0000 82%);
    background: linear-gradient(to bottom, #FF2A68 13%, #8c0000 82%);
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  import $ from 'jquery';
  // eslint-disable-next-line no-unused-vars
  import bootstrap from 'bootstrap';
  import BetsList from '@/components/BetsList';
  import RegisterDialog from '@/components/RegisterDialog';
  import StatsBar from '@/components/StatsBar';
  import UserStats from '@/components/UserStats';
  import Chat from '@/components/Chat';
  import NavBar from '@/components/NavBar';
  import BetControls from '@/components/BetControls';
  import {getRandomString, setInputNumeric} from './helpers';
  import settings from './settings';
  import {bus} from './bus';

  export default {
    name: 'app',
    data: () => ({
      ActiveBets: []
    }),
    computed: mapGetters({
      HighrollerBets: 'HighrollerBets',
      UserBets: 'UserBets',
      LatestBets: 'LatestBets',
      Currency: 'Currency',
      RegisterDialogVisible: 'RegisterDialogVisible'
    }),
    components: {
      BetsList,
      Chat,
      RegisterDialog,
      StatsBar,
      UserStats,
      NavBar,
      BetControls,
    },
    mounted () {
      document.title = settings.AppName;

      if (this.getHashParams().access_token) {
        this.$store.dispatch('login', {
          access_token: this.getHashParams().access_token,
          expires_in: this.getHashParams().expires_in
        });
      }

      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, '/');
      } else {
        window.location.hash = '#';
      }

      this.loadState(getRandomString(20));
      this.ActiveBets = this.HighrollerBets;
      this.setupSignalR();

      $('#betAmount, #chance, #payout').keypress(function (event) {
        setInputNumeric(event, $(this).val());
      });

      $('#mainTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
      });

      const that = this;
      bus.$on('new-bet', () => {
        $('#myBetsButton').click();
        that.ActiveBets = that.UserBets;
      });
    },
    methods: {
      getHashParams () {
        const hashParams = {};
        let e;
        const a = /\+/g;
        const r = /([^&;=]+)=?([^&;]*)/g;
        const d = (s) => {
          return decodeURIComponent(s.replace(a, ' '));
        };
        const q = window.location.hash.substring(1);

// eslint-disable-next-line no-cond-assign
        while (e = r.exec(q)) {
          hashParams[d(e[1])] = d(e[2]);
        }

        return hashParams;
      },
      loadState (clientSeed) {
        this.$store.dispatch('loadState', clientSeed);
      },
      loadUserStats () {
        this.$store.dispatch('loadUserStats');
      },
      setupSignalR () {
        this.$store.dispatch('setupNotifications');
      },
      hideRegisterDialog () {
        this.$store.dispatch('hideRegisterDialog');
      },
      highRollerButtonClicked () {
        $('.mainTab').removeClass('active');
        $('.highRollerButton').addClass('active');
        this.ActiveBets = this.HighrollerBets;
      },
      allBetsButtonClicked () {
        $('.mainTab').removeClass('active');
        $('.allBetsButton').addClass('active');
        this.ActiveBets = this.LatestBets;
      },
      myBetsButtonClicked () {
        $('.mainTab').removeClass('active');
        $('.myBetsButton').addClass('active');
        this.ActiveBets = this.UserBets;
      }
    }
  };
</script>
