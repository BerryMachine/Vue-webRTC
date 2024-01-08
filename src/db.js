import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4PnYcofKTWH8WTKW54HwOVJOJZdwgY0g",
  authDomain: "goom-app-20b1f.firebaseapp.com",
  projectId: "goom-app-20b1f",
  storageBucket: "goom-app-20b1f.appspot.com",
  messagingSenderId: "540200854279",
  appId: "1:540200854279:web:cf3e76a23633308a36dba2"
};
  
  // Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp.firestore();