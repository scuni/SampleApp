<template>
  <table class="table table-condensed table-striped">
    <thead>
    <tr>
      <th>Bet #</th>
      <th>Player</th>
      <th>Time</th>
      <th>Currency</th>
      <th>Bet</th>
      <th class="hidden-xs">Payout</th>
      <th class="hidden-xs">Target</th>
      <th>Roll</th>
      <th>Profit</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="bet in ActiveBets">
      <td class="red-text">{{ bet.BetId }}</td>
      <td class="red-text">{{ bet.Player }}</td>
      <td>{{ bet.Time }}</td>
      <td><CurrencyIcon v-bind:CurrencySymbol='bet.Currency' v-bind:Width='12'></CurrencyIcon></td>
      <td v-html="darkenZero(bet.BetAmount.toFixed(8))"></td>
      <td class="hidden-xs">{{ bet.Payout }}x</td>
      <td class="hidden-xs">{{ bet.Target }}</td>
      <td>{{ bet.Roll.toFixed(4) }}</td>
      <td v-bind:class="formatProfit(bet.Profit)" v-html="darkenZero(bet.Profit.toFixed(8))"></td>
    </tr>
    </tbody>
  </table>
</template>

<style>
  .table-striped tbody tr:nth-of-type(odd) {
    background-color: #1B262D;
  }

  table {
    font-size: 9px;
  }

  th {
    text-align: center;
    color: #878e92;
  }

  .red-text {
    color: #FF2A68;
  }

  .green-text {
    color: #8EC919;
  }

  /* ipad portrait */
  @media all and (device-width: 768px) and (device-height: 1024px) and (orientation: portrait) {
    table {
      font-size: 14px;
    }
  }

  /*ipad landscape */
  @media all and (device-width: 768px) and (device-height: 1024px) and (orientation: landscape) {
    table {
      font-size: 16px;
    }
  }

  /*ipad pro portrait -- this seems to catch ipad lanscape? */
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) {
    table {
      font-size: 16px;
    }
  }

  tbody tr td {
    border-top: 0 !important;
    text-align: center;
  }

  .table thead tr th {
    border-bottom: 0 !important;
  }

  .darken {
    opacity:0.3;
  }
</style>

<script>
  import CurrencyIcon from '@/components/CurrencyIcon';

  export default {
    name: 'BetsList',
    props: {
      ActiveBets: {
        type: Array,
        default: () => []
      }
    },
    components: {
      CurrencyIcon
    },
    methods: {
      formatProfit (x) {
        return (x < 0) ? 'red-text' : 'green-text';
      },
      darkenZero (x) {
        const parts = x.split('.');
        let newX = x;
        let decimalPart = '';
        
        if (parts.length === 2) {
          decimalPart = parts[1].replace(/(0+)$/, '<span class="darken">$1</span>');
          newX = decimalPart.length > 0 ? `${parts[0]}.${decimalPart}` : parts[0];
        }
        
        return newX;
      }
    }
  };
</script>
