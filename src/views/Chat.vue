<template>
  <div class="container-fluid mt-4">
    <div class="mb-3">
      <span class="mb-0 h2 text-primary">{{ roomName }}</span>
      <span class="ml-1" v-if="user && user.uid !== hostID"> 
        Hosted by: <strong class="text-danger">{{ hostDisplayName }}</strong> 
      </span>
    </div>
    <div class="row" v-if="(user && user.uid == hostID) || (attendeeApproved)">
      <div class="col-md-8">
        <vue-webrtc 
        ref="webrtc" 
        width="100%"
        :roomId="roomID"
        v-on:join-room="doAttendeeJoined"
        v-on:left-room="doAttendeeLeft"/>
      </div>
      <div class="col-md-4">
        <button v-if="!attendeeJoined && attendeeApproved" 
        class="btn btn-primary mr-1"
        @click="doJoin">
          Join
        </button>
        <button v-if="attendeeJoined" 
        type="button" 
        class="btn btn-danger mr-1"
        @click="doLeave">
          Leave
        </button>
      <h4 class="mt-2">Attendees</h4>
        <ul class="list-unstyled">
          <li v-for="attendee in attendeeApprovedArr" :key="attendee.id">
            <a v-if="user && user.uid == hostID"
            type="button" 
            class="mr-2" 
            title="Approve attendee"
            @click="toggleApproval(attendee.id)">
              <font-awesome-icon icon="user"></font-awesome-icon>
            </a>
            <span class="mr-2" title="On Air">
              <font-awesome-icon icon="podcast"></font-awesome-icon>
            </span>
            <span></span>
            <span 
            class="pl-1"
            :class="[attendee.id == user.uid ? 'font-weight-bold text-danger' : '']">
              {{attendee.displayName}}
            </span>
          </li>
        </ul>
        <div>
          <h5 class="mt-4">Pending</h5>
          <ul class="list-unstyled">
            <li class="mb-1" v-for="attendee in attendeePendingArr" :key="attendee.id">
              <span>
                <a type="button" 
                class="mr-2" 
                title="Approve attendee"
                @click="toggleApproval(attendee.id)">
                  <font-awesome-icon icon="user"></font-awesome-icon>
                </a>
                <a type="button" 
                class="text-secondary pr-1" 
                title="Delete Attendee"
                @click="deleteAttendee(attendee.id)">
                  <font-awesome-icon icon="trash"></font-awesome-icon>
                </a>
              </span>
              <span 
              class="pl-1"
              :class="[attendee.id == user.uid ? 'font-weight-bold text-danger' : '']">
                {{attendee.displayName}}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="lead">
        Hi <strong class="text-primary font-weight-bold">{{ user.displayName }}</strong>, you're currently in the room
        waiting for the owner of the chat to add you to the meeting. Please wait.
      </p>
    </div>
  </div>
</template>

<script>
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import db from '../db'
  import firebase from 'firebase/compat/app';
  import 'firebase/compat/auth';
import { faPiggyBank, faTty } from '@fortawesome/free-solid-svg-icons';
  export default {
    data: function() {
      return {
        hostID: this.$route.params.hostID,
        roomID: this.$route.params.roomID,
        roomName: null,
        hostDisplayName: null,
        attendeePendingArr: [],
        attendeesApprovedArr: [],
        attendeeApproved: false,
        attendeeJoined: false

      }
    },
    
    components: {
      FontAwesomeIcon
    },

    methods: {
      toggleApproval: function(attendeeID) {
        if(this.user && this.user.uid == this.hostID) {
          const ref = db.collection('users').doc(this.user.uid).collection('rooms').doc(this.roomID).collection('attendees').doc(attendeeID)
          
          ref.get().then(attendeeDoc => {
            const approved = attendeeDoc.data().approved

            if(approved) {
              ref.update({
                approved: !approved
              })
            } else {
              ref.update({
                approved: true
              })
            }
          })
        }
      },
      deleteAttendee: function(attendeeID) {
        if(this.user && this.user.uid == this.hostID) {
          db.collection('users')
          .doc(this.user.uid)
          .collection('rooms')
          .doc(this.roomID)
          .collection('attendees')
          .doc(attendeeID)
          .delete()
        }
      },

      doJoin: function() {
        this.$refs.webrtc.join()
        this.attendeeJoined = true
      },

      doLeave: function() {
        this.$refs.webrtc.leave()
        this.attendeeJoined = false
      },

      doAttendeeJoined: function(joinID) {
        const ref = db.collection('users')
        .doc(this.hostID)
        .collection('rooms')
        .doc(this.roomID)
        .collection('attendees')
        .doc(this.uid)

        ref.update({
          webRTCID: joinID
        })
      },

      doAttendeeLeft: function(leftID) {
        const ref = db.collection('users')
        .doc(this.hostID)
        .collection('rooms')
        .doc(this.roomID)
        .collection('attendees')
        .doc(this.uid)

        ref.update({
          webRTCID: null
        })
      }

    },

    props: ['user'],

    mounted() {
      const roomRef = db.collection('users')
      .doc(this.$route.params.hostID)
      .collection('rooms')
      .doc(this.$route.params.roomID)

      //Get Room Name
      roomRef.get().then(roomDoc => {
        if(roomDoc.exists) this.roomName = roomDoc.data().name 
        else this.$router.push('/')
      })

      //Get Host Name
      roomRef.collection('attendees').onSnapshot(snapshot => {
        let userCheckedIn = false
        let tempPending = []
        let tempApproved = []
        snapshot.forEach(attendeeDoc => {

          //Host Display Name
          if(this.hostID === attendeeDoc.id) {
            this.hostDisplayName = attendeeDoc.data().displayName
          }

          //Checking If User Checked In
          if(this.user && this.user.uid == attendeeDoc.id) {
            userCheckedIn = true
          }

          //Push all approved users to approved array
          if(attendeeDoc.data().approved) {
            if(this.user.uid == attendeeDoc.id) {
              this.attendeeApproved = true
            }

            tempApproved.push({
              id: attendeeDoc.id,
              displayName: attendeeDoc.data().displayName,
              approved: attendeeDoc.data().approved,
              webRTCID: attendeeDoc.data().webRTCID
            })
          } else { //Push all non-approved users to pending array
            if(this.user.uid == attendeeDoc.id) {
              this.attendeeApproved = false
            }

            tempPending.push({
              id: attendeeDoc.id,
              displayName: attendeeDoc.data().displayName,
              approved: attendeeDoc.data().approved,
              webRTCID: attendeeDoc.data().webRTCID
            })
          }
        })

        if(!userCheckedIn) {
          this.$router.push(`/checkin/${this.hostID}/${this.roomID}`)
        }

        this.attendeePendingArr = tempPending
        this.attendeeApprovedArr = tempApproved
      })
    }

  }
</script>

<style lang="scss">
  .video-list {
    margin-bottom: 10px;
    background: transparent !important;
  }
  .video-item {
    width: 50%;
    display: inline-block;
    background: transparent !important;
  }
  .video-item video {
    width: 100%;
    height: auto;
  }
</style>