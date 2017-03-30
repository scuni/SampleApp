import Cookies from 'js-cookie';

export default {
  remove () {
    Cookies.remove('token');
  },
  get () {
    return Cookies.get('token');
  },
  set (value, expiresIn) {
    Cookies.set('token', value, {expires: new Date(new Date().getTime() + expiresIn * 1000)});
  },
  isNotDefined () {
    return Cookies.get('token') === undefined;
  }
};
