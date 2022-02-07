document.addEventListener('DOMContentLoaded', function () {
  if (!eventId)
    return;

  // Initialize the FirebaseUI Widget using Firebase.
  const db = firebase.firestore();
  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  const uiConfig = {
    signInSuccessUrl: window.location,
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // Other config options...
  };
  ui.start('#firebaseui-auth-container', uiConfig);

  firebase.auth().onAuthStateChanged(function (user) {
    //var user = firebase.auth().currentUser;
    if (user) {
      console.log('signed in!');
      let userName = user.displayName;
      query("#registration-text").innerHTML = "Hi" + (userName ? " " + userName : "") + "! To join the event, please register below.";
      query("#registration-form").style.display = "inline-block";
      query("#login-button").style.display = "none";

      db.collection('events').doc(eventId).get().then((doc) => {
        if (!doc.exists)
          return;

        event = doc;
        console.log("Event data:", event);
        event.data().registrationSurvey.get().then((doc) => {
          try {
            if (!doc.exists)
              return;

            survey = doc;
            console.log("survey data:", survey);
            registrationQuestions = JSON.parse(survey.data().questionList);
            buildForm(registrationQuestions.items, get('registration-questions'));
            console.log(registrationQuestions);
          } catch (e) {
            console.log("Error parsing registration questions:", e);
          }
        });
      }).catch((e) => {
        console.log("Error getting document:", e);
      });
    } else {
      console.log('not signed in');
      query("#registration-text").innerHTML = "Hi there! To join the event, please log in to register!";
      query("#registration-form").style.display = "none";
      query("#login-button").style.display = "inline-block";
    }
  });

  get('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      let user = firebase.auth().currentUser;
      if (user) {
        // TODO: Matching question answer
        // update users collection
        let surveyData = {
          surveys: [{
            survey: db.doc('surveys/' + survey.id),
            response: '',
          }],
        }
        let eventJoined = {
          events: [{
            event: db.doc('events/' + eventId),
          }]
        }
        console.log("updating users collection");
        db.collection('users').doc(user.uid).get().then((u) => {
          if (!u.exists) {
            db.collection('users').doc(user.uid).collection('private').doc('surveyData').set(surveyData);
            db.collection('users').doc(user.uid).collection('private').doc('eventsJoined').set(eventJoined);
          } else {
            db.collection('users').doc(user.uid).collection('private').doc('surveyData').update(surveyData);
            db.collection('users').doc(user.uid).collection('private').doc('eventsJoined').update(eventJoined);
          }
        });

        // update events collection
        console.log("updating events collection");
        db.collection('events').doc(eventId).collection('usersJoined').doc(user.uid).set({});

        // update surveys collection
        console.log("updating surveys collection");
        db.collection('surveys').doc(survey.id).collection('usersSubmitted').doc(user.uid).set({});
      } else {
        throw new Error('User is not signed in.');
      }
    } catch (e) {

    }
  });
});
