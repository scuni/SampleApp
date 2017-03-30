import {currencies} from './currencies'
import toastr from 'toastr'

export const formatCurrency = (c) => {
  return currencies.find(currency => currency.value === c).symbol
}

export const formatTarget = (chance, target) => {
  if (target === 0) {
    return `> ${(99.9999 - chance).toFixed(4)}`
  } else {
    return `< ${chance.toFixed(4)}`
  }
}

export const getRandomString = (n) => {
  // should just use crypto random instead? This is from Stack overflow
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < n; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

export const formatDecimal = (x, n) => {
  return Math.floor(x * Math.pow(10, n) + 1e-6) / Math.pow(10, n).toFixed(n).replace(/([.].*?)0+$/, '$1').replace(/[.]$/, '')
}

export const setInputNumeric = (event, inputText) => {
  const controlKeys = [8, 9, 13]
  const isControlKey = controlKeys.join(',').match(new RegExp(event.which))
  if (!(!event.which ||
    (event.which >= 48 && event.which <= 57) ||
    isControlKey ||
    (event.which === 46 && (inputText.indexOf('.') > -1 === false)))) {
    event.preventDefault()
  }
}

export const showError = (error) => {
  if (error.response) {
    toastr.error(error.response.status === 401 ? 'You must be logged in' : 'An error occured')
  }
}
