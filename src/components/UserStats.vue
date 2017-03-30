<template>
  <ul class="row statsList list-unstyled">
    <li v-for="currency in Currencies">
      <div class="col-xs-12 col-sm-offset-2 col-sm-8 col-md-offset-3 col-md-6 statBackground">
        <div class="col-xs-offset-1 col-xs-1 currencyContainer">
          <CurrencyIcon v-bind:Currency='currency.value' v-bind:Width='30'></CurrencyIcon>
        </div>
        <div class="col-xs-3">
          <div class="ui-panel2">
            <p>{{ getBets(currency.value) }}</p>
            <label>Bets</label>
          </div>
        </div>
        <div class="col-xs-3">
          <div class="ui-panel2">
            <p>{{ getWagered(currency.value) }}</p>
            <label>Wagered</label>
          </div>
        </div>
        <div class="col-xs-3">
          <div class="ui-panel2">
            <p>{{ getProfit(currency.value) }}</p>
            <label>Profit</label>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<style>
  .statsList {
    margin-top: 10px;
  }

  .statBackground {
    background-color: #1b262d;
  }

  .currencyContainer {
    padding-top: 10px;
  }
</style>

<script>
import {mapGetters} from 'vuex';
import {currencies} from '../currencies';
import CurrencyIcon from '@/components/CurrencyIcon';

export default {
  name: 'UserStats',
  data: () => ({
    Currencies: currencies
  }),
  computed: mapGetters({
    UserStats: 'UserStats'
  }),
  components: {
    CurrencyIcon
  },
  methods: {
    getBets (currency) {
      const x = this.findElement(this.UserStats, 'Currency', currency);

      if (x === undefined) {
        return 0;
      }

      return x.NumBets;
    },
    getProfit (currency) {
      const x = this.findElement(this.UserStats, 'Currency', currency);

      if (x === undefined) {
        return 0;
      }

      return x.Profit;
    },
    getWagered (currency) {
      const x = this.findElement(this.UserStats, 'Currency', currency);
      if (x === undefined) {
        return 0;
      }
      
      return x.Wagered;
    },
    findElement (arr, propName, propValue) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][propName] === propValue) {
          return arr[i];
        }
      }
    }
  }
};
</script>
