<template>
  <div class="row">
    <div class="col-xs-12">
      <div class="chat">
        <nav class="chat-tabs">
          <a v-for="Channel in Channels" v-on:click.prevent='CurrentChannel = Channel' v-bind:class="{ active: Channel === CurrentChannel }">
            <div>{{ Channel.Name }}</div>
          </a>
        </nav>
        <div class="chat-frame">
          <div id="chat-messages" class="chat-messages">
            <div class="chat-item" v-for="Message in Messages">
              <div class="chat-item-detail">
                <div class="chat-item-detail-date">{{ formatDate(Message.Date) }}</div>
                <div class="chat-item-detail-username">{{ Message.UserName }}</div>
              </div>
              <div class="chat-item-text" v-html="formatMessage(Message.Message)"></div>
            </div>
          </div>
          <div class="chat-actions">
            <div class="chat-sign-in" v-if="ConnectionNeeded">Sign in to chat</div>
            <div v-if="!ConnectionNeeded">
              <input type="text" class="form-control" v-model="Message" placeholder="Your message" v-on:keyup.enter='send'></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .chat-tabs {
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: end;
    -webkit-align-items: flex-end;
    -ms-flex-align: end;
    align-items: flex-end;
  }

  .chat-tabs a {
    display: block;
    float: left;
    padding: 15px;
    color: #878e92;
    font-weight: bold;
    text-decoration: none;
    border-radius: 6px 6px 0 0;
  }

  .chat-tabs a:hover {
    cursor: pointer;
    color: #878e92;
    background-color: #29363c;
  }

  .chat-tabs a.active {
    background-color: #3c4e57;
    color: white;
  }

  .chat-frame {
    background-color: #1b262d;
    position: relative;
    z-index: 100;
    height: 400px;
    width: 100%;
    border-radius: 0 0 6px 6px;
  }

  .chat-messages {
    height: 366px;
    max-height: 366px;
    overflow-y: scroll;
  }

  .chat-actions {
    height: 34px;
    background-color: #374850;
  }

  .chat-actions input.form-control {
    width: 100%;
    max-width: 100%;
    text-align: left;
  }

  .chat-actions .chat-sign-in {
    padding-top: 5px;
    padding-left: 10px;
  }

  .chat-item {
    margin: 0 20px;
    padding: 5px 0;
    vertical-align: top;
    min-height: 1.5em;
  }

  .chat-item:last-child {
    padding-bottom: 10px;
  }

  .chat-item .chat-item-detail .chat-item-detail-date {
    float:right;
    color:#878e92;
  }

  .chat-item .chat-item-detail .chat-item-detail-username {
    font-weight: bold;
    color:#878e92;
  }

  .chat-item .chat-item-text {
    padding-right: 20px;
  }
</style>

<script>
  import $ from 'jquery';
  import {bus} from '../bus';
  import settings from '../settings';
  import {mapGetters} from 'vuex';
  import moment from 'moment';

  export default {
    name: 'Chat',
    data: () => ({
      Channels: [],
      CurrentChannel: null,
      ConnectionNeeded: true,
      Message: ''
    }),
    computed: {
      ...mapGetters({
        ChatChannels: 'ChatChannels'
      }),
      Messages () {
        return this.CurrentChannel ? (this.ChatChannels[this.channelKey(this.CurrentChannel)] || {Messages: []}).Messages : [];
      },
      Users () {
        return this.CurrentChannel ? (this.ChatChannels[this.CurrentChannel.AppId] || {Users: []}).Users : [];
      },
      AnonymousUsers (Channel) {
        return (this.ChatChannels[Channel.AppId] || {AnonymousUsers: 0}).AnonymousUsers;
      },
      TotalUsers (Channel) {
        return ((this.ChatChannels[Channel.AppId] || {Users: []}).Users).length + (this.ChatChannels[Channel.AppId] || {AnonymousUsers: 0}).AnonymousUsers;
      }
    },
    mounted () {
      bus.$on('user-connected', () => {
        this.ConnectionNeeded = false;
      });
      bus.$on('notifications-started', () => {
        this.addChannel({AppId: settings.AppId, Language: 'EN', Name: (settings.AppId === 0) ? 'Betking' : settings.AppName});
        if (settings.AppId !== 0) {
          this.addChannel({AppId: 0, Language: 'EN', Name: 'Betking'});
        }
      });
    },
    updated () {
      this.scrollToBottom();
    },
    methods: {
      channelKey (channel) {
        return channel ? `${channel.AppId}-${channel.Language}` : null;
      },
      addChannel (channel) {
        this.$store.dispatch('loadChatMessages', channel);
        this.Channels.push(channel);
        this.CurrentChannel = this.CurrentChannel || channel;
      },
      send () {
        const data = {
          AppId: this.CurrentChannel.AppId,
          Language: this.CurrentChannel.Language,
          Message: this.Message
        };
        this.$store.dispatch('sendChatMessage', data);
        this.Message = '';
      },
      formatDate (date) {
        return moment(date).format('HH:mm');
      },
      formatMessage (message) {
        return message.replace(/<(?:.|\n)*?>/gm, '');
      },
      scrollToBottom () {
        const elem = $('#chat-messages')[0];
        elem.scrollTop = elem.scrollHeight;
      }
    }
  };
</script>
