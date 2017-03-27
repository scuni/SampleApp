import token from './token'
import Settings from './settings'

const start = ({hubConnection, socketHub}) => {
  hubConnection.url = Settings.SocketUrl
  hubConnection.qs = {Bearer: token.get()}
  hubConnection.start({transport: ['serverSentEvents', 'longPolling']}).done(function () {
    socketHub.invoke('joinApp', Settings.AppId)
  })
}

const stop = ({hubConnection}) => {
  hubConnection.stop()
}

export default {
  start (signalr) {
    start(signalr)
  },
  restart (signalr) {
    stop(signalr)
    start(signalr)
  }
}
