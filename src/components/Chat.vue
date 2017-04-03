<template>
  <div class="row">
    <div class="col-xs-12">
      <div v-if="ConnectionNeeded">Sign in to chat</div>
      <div v-if="!ConnectionNeeded">
        <ul class='nav nav-tabs' role="tablist">
          <li v-for="Channel in Channels" role="presentation" v-bind:class="{ active: Channel === CurrentChannel }">
            <a href='#' v-on:click.prevent='CurrentChannel = Channel'>{{ Channel.Language }} - {{ Channel.AppId }}</a>
          </li>
        </ul>
        <div v-for="Message in Messages">
          {{ Message.UserName }}: {{ Message.Message }} {{ formatDate(Message.Date) }} 
        </div>
        <textarea class="form-control" v-model="Message" placeholder="Your message"></textarea>
        <button type="button" class="btn btn-default" v-on:click.prevent='send'>Send</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>

<script>
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
        ChatMessages: 'ChatMessages'
      }),
      Messages () {
        return this.CurrentChannel ? this.ChatMessages[this.channelKey(this.CurrentChannel)] : [];
      }
    },
    mounted () {
      bus.$on('user-connected', () => {
        this.ConnectionNeeded = false;
      });
      bus.$on('notifications-started', () => {
        this.addChannel({AppId: settings.AppId, Language: 'EN'});
        if (settings.AppId !== 0) {
          this.addChannel({AppId: 0, Language: 'EN'});
        }
      });
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
      }
    }
  };
</script>
