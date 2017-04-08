<template>
  <div class="row">
    <div class="col-xs-4 col-sm-3 col-md-2">
      <div class="ui-panel2">
        <div class="dropdown-toggle" id="currencyMenu" data-toggle="dropdown" aria-haspopup="true"
             aria-expanded="true">
          <p id="Balance">{{ Balance.toFixed(8) }} <CurrencyIcon v-bind:Currency='Currency' v-bind:Width='15'></CurrencyIcon> <span class="caret"></span></p>
        </div>
        <ul class="dropdown-menu" aria-labelledby="currencyMenu">
          <li v-for="currency in Currencies"><a href="#" v-on:click.prevent="onCurrencyChange(currency.value)">{{ currency.name }}</a></li>
        </ul>
        <label for="Balance">Balance</label>
      </div>
    </div>

    <div class="col-xs-4 col-sm-3 col-md-2">
      <div class="ui-panel2">
        <p id="MaxWin">{{ MaxWin.toFixed(8) }}</p>
        <label for="MaxWin">Max Win</label>
      </div>
    </div>

    <div class="col-xs-4 col-sm-3 col-md-2">
      <div class="ui-panel2">
        <p id="Bankroll">{{ Bankroll.toFixed(8) }}</p>
        <label for="Bankroll">Bankroll</label>
      </div>
    </div>

    <div class="hidden-xs col-sm-3 col-md-2">
      <div class="ui-panel2">
        <p id="Wagered">{{ Wagered.toFixed(8) }}</p>
        <label for="Wagered">Wagered</label>
      </div>
    </div>

    <div class="hidden-xs hidden-sm col-md-2">
      <div class="ui-panel2">
        <p id="Profit">{{ Profit.toFixed(8) }}</p>
        <label for="Profit">Profit</label>
      </div>
    </div>

    <div class="hidden-xs hidden-sm col-md-2">
      <div class="ui-panel2">
        <p id="NumBets">{{ NumBets }}</p>
        <label for="NumBets">Bets</label>
      </div>
    </div>
  </div>
</template>

<style>
  .ui-panel2 {
    padding: 8px;
    text-align: center;
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  import {currencies} from '../currencies';
  import CurrencyIcon from '@/components/CurrencyIcon';

  export default {
    name: 'StatsBar',
    data: () => ({
      Currencies: currencies
    }),
    components: {
      CurrencyIcon
    },
    computed: mapGetters({
      Balance: 'Balance',
      Currency: 'Currency',
      NumBets: 'NumBets',
      MaxWin: 'MaxWin',
      Bankroll: 'Bankroll',
      Wagered: 'Wagered',
      Profit: 'Profit'
    }),
    methods: {
      onCurrencyChange (c) {
        this.$store.dispatch('changeCurrency', c);
      }
    }
  };
</script>
