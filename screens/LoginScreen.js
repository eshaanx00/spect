import React, {
    Component
} from 'react'
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native'

export default class LoginScreen extends Component {
    signInWithGoogleAsync=async()=> {
        try {
            const result = await Google.logInAsync({
                behavior:'web',
                androidClientId: 1059295380423-f16mpit8png0sp855be52ls8187h2jmg.apps.googleusercontent.com,
                iosClientId: 1059295380423-ch16erdh2so5a9ebb3qqqfv7757e1329.apps.googleusercontent.com,
                scopes: ['profile', 'email'],
            });

            if (result.type === 'success') {
                return result.accessToken;
            } else {
                return {
                    cancelled: true
                };
            }
        } catch (e) {
            return {
                error: true
            };
        }
    }

    onSignIn=(googleUser)=> {
        console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe();
          // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken);
            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential)
            .then(function(result){
                if(result.additionalUserInfo.isNewUser){
                    firebase.database().ref("/users/"+result.user.uid).set({
                        gmail:result.user.email,
                        profile_picture:result.additionUserInfo.profile.picture,
                        first_name:result.additionalUserInfo.profile.given_name,
                        last_name:result.additionalUserInfo.profile.family_name,
                        current_theme:'dark',
                    }).then(function(snapshot){
                        
                    })
                }
            })
            .catch((error) => {
              // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
               // The email of the user's account used.
                var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
              // ...
            });
        } else {
            console.log('User already signed-in Firebase.');
        }
        });
    }
isUserEqual=(googleUser, firebaseUser)=> {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
              // We don't need to reauth the Firebase connection.
                return true;
            }
        }
        }
        return false;
    }
    render() {
        return (   
        <View>
            <TouchableOpacity onpress={()=>{this.signInWithGoogleAsync()}}><Text>Sign in with google</Text></TouchableOpacity>
        </View>
        )
    }
}