<template>
  <img :src="Url" :width="Width" class="currency-icon"/>
</template>

<style>
  .currency-icon {
    vertical-align: text-top;
  }
</style>

<script>
  import {currencies} from '../currencies'

  export default {
    name: 'CurrencyIcon',
    props: {
      Currency: {
        type: Number
      },
      CurrencySymbol: {
        type: String
      },
      Width: {
        type: Number
      }
    },
    computed: {
      Url () {
        if (this.CurrencySymbol) {
          return currencies.find(currency => currency.symbol === this.CurrencySymbol).icon
        }
        return currencies[this.Currency].icon
      }
    }
  }
</script>
