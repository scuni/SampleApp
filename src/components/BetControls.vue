<template>
  <div class="row">
    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3">
      <div class="ui-panel">
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group">
              <label class="label-control" for="betAmount">Bet Amount</label>
              <div class="input-group">
                <input id="betAmount" v-model="BetAmount" v-on:keyup="updateProfit" class="form-control"
                       type="text" autocomplete="off">
                <span class="input-group-addon"><CurrencyIcon v-bind:Currency='Currency' v-bind:Width='20'></CurrencyIcon></span>
              </div>
            </div>
          </div>
          <div class="col-xs-6">
            <div class="form-group">
              <label class="label-control" for="chance">Profit</label>
              <div class="input-group">
                <input id="betProfit" v-model="BetProfit" v-on:keyup="updateBetAmount" class="form-control" type="text"
                       autocomplete="off">
                <span class="input-group-addon"><CurrencyIcon v-bind:Currency='Currency' v-bind:Width='20'></CurrencyIcon></span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group">
              <label class="label-control" for="chance">Chance</label>
              <div class="input-group">
                <input id="chance" v-model="Chance" v-on:keyup="updateChance" class="form-control"
                       type="text" autocomplete="off">
                <span class="input-group-addon">%</span>
              </div>
            </div>
          </div>
          <div class="col-xs-6">
            <div class="form-group">
              <label class="label-control" for="payout">Payout</label>
              <div class="input-group">
                <input id="payout" v-model="Payout" v-on:keyup="updatePayout" class="form-control"
                       type="text" autocomplete="off">
                <span class="input-group-addon">X</span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group pull-right">
              <button v-on:click="bet(0)" v-bind:disabled="WaitingOnBetResult" id="betHiButton"
                      class="btn btn-custom" type="button">Hi
								<span class="target">{{ HiTarget }}</span>
              </button>
            </div>
          </div>
          <div class="col-xs-2">
            <div class="form-group pull-left">
              <button v-on:click="bet(1)" v-bind:disabled="WaitingOnBetResult" id="betLoButton"
                      class="btn btn-custom" type="button">Lo
								<span class="target">{{ LoTarget }}</span>
              </button>
            </div>
          </div>
          <div class="col-xs-2">
            <p @click="showProvablyFairDialog"
               class="btn btn-default fa fa-balance-scale provablyFairButton"></p>
            <ProvablyFairModal v-if="ProvablyFairDialogVisible" @close="hideProvablyFairDialog">
            </ProvablyFairModal>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-12">
            <button v-on:click="halvedBetAmount" class="btn btn-default" type="button">1/2</button>
            <button v-on:click="doubleBetAmount" class="btn btn-default" type="button">x2</button>
            <button v-on:click="minBetAmount" class="btn btn-default" type="button">min</button>
            <button v-on:click="maxBetAmount" class="btn btn-default" type="button">max</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .ui-panel {
    background-color: #1B262D;
    padding: 8px;
    text-align: center;
  }

  .btn-custom {
    width: 50px;
    height: 45px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    background: -webkit-linear-gradient(top, #FF2A68 13%, #8c0000 82%);
    background: linear-gradient(to bottom, #FF2A68 13%, #8c0000 82%);
    border: 0;
    padding: 5px;
    margin: 0 1px 0 0;
    position: relative;
  }

  .btn-custom:hover {
    background: -webkit-linear-gradient(top, #FF2A68 13%, #8c0000 82%);
    background: linear-gradient(to bottom, #FF2A68 13%, #8c0000 82%);
    color: #fff;
  }

  .btn-custom:focus {
    background: -webkit-linear-gradient(top, #FF2A68 13%, #8c0000 82%);
    background: linear-gradient(to bottom, #FF2A68 13%, #8c0000 82%);
    color: #fff;
  }

  .btn-default:focus {
    color: #FBFCFE;
    background-color: #303E46;
    border-color: #303E46;
  }

  .target {
    font-size: 9px;
    float: right;
  }

  .input-group-addon {
    color: #FBFCFE;
    background-color: #303e46;
    border: none;
    border-left: 1px solid #1b262d !important;
  }

  .provablyFairButton {
    margin-top: 9px;
    margin-left: 14px;
  }
</style>
<script>
  import toastr from 'toastr';
  import {mapGetters} from 'vuex';
  import ProvablyFairModal from '@/components/ProvablyFairModal';
  import CurrencyIcon from '@/components/CurrencyIcon';
  import {formatDecimal} from '../helpers';
  import token from '../token';
  import settings from '../settings';

  export default {
    name: 'BetControls',
    data: () => ({
      Chance: 49.5,
      BetAmount: 0,
      BetProfit: 0,
      Payout: 2,
      LoTarget: '< 49.5000',
      HiTarget: '> 50.4999'
    }),
    components: {
      ProvablyFairModal,
      CurrencyIcon
    },
    computed: mapGetters({
      WaitingOnBetResult: 'WaitingOnBetResult',
      Currency: 'Currency',
      Balance: 'Balance',
      ProvablyFairDialogVisible: 'ProvablyFairDialogVisible'
    }),
    methods: {
      bet (target) {
        if (token.isNotDefined()) {
          toastr.error('You must login to make a bet');
          return;
        }

        if (parseFloat(this.BetAmount) > this.Balance) {
          toastr.error('Balance too low');
          return;
        }

        if (this.BetProfit < 0.00000001) {
          toastr.error('Profit must be more than 0.00000001');
          return;
        }

        if (parseFloat(this.BetAmount) < settings.MinBetAmount) {
          toastr.error(`You must bet more than ${settings.MinBetAmount}`);
          return;
        }

        this.$store.dispatch('bet', {Chance: this.Chance, BetAmount: parseFloat(this.BetAmount), Target: target});
      },
      updateTargets () {
        let c = this.Chance;

        if (isNaN(c) || c === '') {
          c = 0.0001;
        }

        this.HiTarget = `> ${(99.9999 - c).toFixed(4)}`;
        this.LoTarget = `< ${parseFloat(c).toFixed(4)}`;
      },
      updateChance () {
        let fc = this.Chance;

        if (isNaN(fc) || fc === '' || fc === 0) {
          this.Payout = 0;
        } else {
          if (fc < 0.0001) {
            fc = 0.0001;
          }

          if (fc > 98.99) {
            fc = 98.99;
          }

          this.Payout = formatDecimal(99 / fc, 8);
          this.Chance = fc;
        }

        this.updateProfit();
        this.updateTargets();
      },
      updatePayout () {
        let fp = this.Payout;

        if (isNaN(fp) || fp === '' || fp === 0) {
          this.Chance = 0;
        } else {
          if (fp > 990000) {
            fp = 990000;
          }

          this.Chance = formatDecimal(99 / fp, 4);
          this.Payout = fp;
        }

        this.updateProfit();
        this.updateTargets();
      },
      updateProfit () {
        if (isNaN(parseFloat(this.BetAmount))) {
          this.BetProfit = 0;
        } else if (this.Payout > 0) {
          const p = this.BetAmount * this.Payout - this.BetAmount;
          
          this.BetProfit = p.toFixed(8);
        } else {
          this.BetProfit = 0;
        }
      },
      showProvablyFairDialog () {
        this.$store.dispatch('showProvablyFairDialog');
      },
      hideProvablyFairDialog () {
        this.$store.dispatch('hideProvablyFairDialog');
      },
      updateBetAmount () {
        if (isNaN(parseFloat(this.BetProfit))) {
          this.BetAmount = 0;
        } else if (this.BetProfit > 0) {
          let p = this.BetProfit / (this.Payout - 1);

          if (p > this.Balance) {
            p = this.Balance;
          }

          this.BetAmount = p.toFixed(8);
        } else {
          this.BetAmount = 0;
        }
      },
      halvedBetAmount (e) {
        let betAmount = this.BetAmount / 2;

        if (betAmount < settings.MinBetAmount) {
          betAmount = settings.MinBetAmount;
        }

        this.BetAmount = betAmount.toFixed(8);
        this.updateProfit();
      },
      doubleBetAmount () {
        this.BetAmount = (this.BetAmount * 2).toFixed(8);

        if (parseFloat(this.BetAmount) > this.Balance) {
          this.BetAmount = this.Balance;
        }

        this.updateProfit();
      },
      minBetAmount () {
        let s = settings.MinBetAmount;
        if (this.Payout < 2) {
          const payoutInverseMultiplier = 1 / (this.Payout - 1);
          s *= Math.round(payoutInverseMultiplier);
          
          if (payoutInverseMultiplier % 1 > 0 && (payoutInverseMultiplier % 1) < 0.5) {
            s += settings.MinBetAmount;
          }
        }

        this.BetAmount = s.toFixed(8);
        this.updateProfit();
      },
      maxBetAmount () {
        this.BetAmount = this.Balance;
        this.updateProfit();
      }
    }
  };
</script>
