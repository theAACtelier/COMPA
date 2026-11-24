// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, collection, addDoc, setDoc, updateDoc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCtcfjGQ59SDGdORZPWjWZpkMFS9u0DBNM",
    authDomain: "aac-conversations.firebaseapp.com",
    projectId: "aac-conversations",
    storageBucket: "aac-conversations.appspot.com",
    messagingSenderId: "297700374763",
    appId: "1:297700374763:web:6851e18b3a8a6518ffa6ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const pausedStateSyncRef = doc(db, 'state_sync', 'paused_state');
export const intentionStateSyncRef = doc(db, 'state_sync', 'intention_state');
export const logDataCollectionRef = collection(db, 'log_data');


const getDocIdFromNameAndCondition = (name, condition) => {
    return 'name-' + name.replace(/\s+/g, '') + '---condition-' + condition;
}

export const changePausedSyncState = (to, name, condition) => {
    setDoc(pausedStateSyncRef, { paused: to }, { merge: true });
    const docId = getDocIdFromNameAndCondition(name, condition);
    const docRef = doc(logDataCollectionRef, docId);
    const timestamp = new Date().getTime()
    const buttonPressedDocRef = doc(docRef, 'pauseButtonPressed', timestamp.toString())
    setDoc(buttonPressedDocRef, {
        timestamp: timestamp,
        timestampString: new Date().toString(),
        button: 'pause/unpause',
        to: to ? 'pause' : 'unpause'
    }, { merge: true });
}

export const changeIntentionSyncState = (to, name, condition) => {
    setDoc(intentionStateSyncRef, { intention: to }, { merge: true });
    const docId = getDocIdFromNameAndCondition(name, condition);
    const docRef = doc(logDataCollectionRef, docId);
    const timestamp = new Date().getTime()
    const buttonPressedDocRef = doc(docRef, 'intentionButtonPressed', timestamp.toString())
    setDoc(buttonPressedDocRef, {
        timestamp: timestamp,
        timestampString: new Date().toString(),
        button: 'intention',
        to: to
    }, { merge: true });
}

export const syncTranscript = (name, condition, transcript) => {
    const docId = getDocIdFromNameAndCondition(name, condition);
    const docRef = doc(logDataCollectionRef, docId);
    setDoc(docRef, {
        name,
        condition,
        transcript
    }, { merge: true });
}

export const syncCondIntentionPhrases = async (name, condition, intentionType, generatedPhrases, timeObject) => {
    const docId = getDocIdFromNameAndCondition(name, condition);
    const docRef = doc(logDataCollectionRef, docId);
    const collectionRef = collection(docRef, 'intentionPhrasesAI');
    let ref = await addDoc(collectionRef, {
        timestamp: timeObject.getTime(),
        timestampString: timeObject.toString(),
        intentionType,
        generatedPhrases
    })
    return ref.id
}

export const setIntentionPhraseClicked = async (name, condition, intentionPhraseId, clickedIndex, clickedPhrase) => {
    const docId = getDocIdFromNameAndCondition(name, condition);
    const docRef = doc(logDataCollectionRef, docId);
    const collectionRef = collection(docRef, 'intentionPhrasesAI')
    const intentionPhraseDocRef = doc(collectionRef, intentionPhraseId)
    updateDoc(intentionPhraseDocRef, {
        clickedIndex,
        clickedPhrase
    })
}