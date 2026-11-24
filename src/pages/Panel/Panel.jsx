import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import BackIcon from "@mui/icons-material/ArrowBack";
import './styles.css';

import AACInterface1 from "./AACInterface1";
import AACInterface2 from "./AACInterface2";
import AACInterface3 from "./AACInterface3";
import CPInterface from "./CPInterface";
import Login from "./components/Login";
import { chatGPTService } from './components/ChatGPTService';

//Get rid of firebase for local testing
/*
import { pausedStateSyncRef, changePausedSyncState, intentionStateSyncRef, changeIntentionSyncState, syncTranscript, syncCondIntentionPhrases } from "../../../firebase";
import { onSnapshot } from '../firebase/firestore'
*/

import { getSyncState, updateSyncState, isGistConfigured } from '../utils/gistSync';

const Panel = ({ }) => {

  const [paused, setPaused] = useState(false);
  const [pausedSync, setPausedSync] = useState(false)
  const [generatePhrases, setGeneratePhrases] = useState(false);
  const [generateIntentPhrases, setGenerateIntentPhrases] = useState(false);

  // transcript contains the current state of the transcript.
  const [transcript, setTranscript] = useState([]);
  const [displayTranscript, setDisplayTranscript] = useState([]);
  const [newEle, setNewEle] = useState(null);

  // no-server CHATGPT logic for condition2
  const [response, setResponse] = useState([]);
  const [prompt, setPrompt] = useState({
    prompt1: "",
    prompt2: ""
  });

  // user's name
  const [name, setName] = useState("");

  // Intention chosen by AAC user: 0 = Opinion, 1 = Reply, 2 = Question, 3 = Yes/No, 4 = Other
  const [intention, setIntention] = useState(0);
  const [intentionSync, setIntentionSync] = useState(0);

  // AAC or CP interface
  const [isAAC, setIsAAC] = useState(null);

  // Condition 1, 2, 3 for study
  const [condition, setCondition] = useState(null);

  //voice choices (two)
  const [voiceChoice, setVoiceChoice] = useState("");

  // for condition3
  const [prompt3, setPrompt3] = useState({
    prompt1: "",
    prompt2: ""
  });

  // Replace generateIntentPhrases with more specific state
  const [intentionToGenerate, setIntentionToGenerate] = useState(null);

  // Replace the four separate states with one object state
  const [intentionResponses, setIntentionResponses] = useState({
    reply: [],
    opinion: [],
    question: [],
    yesno: []
  });

  // Add mapping for intention numbers to types
  const intentionTypeMap = {
    0: 'reply',
    1: 'opinion',
    2: 'question',
    3: 'yesno'
  };

  // Designate dark theme for MUI components
  const theme = createTheme({
    palette: {
      mode: "dark"
    }
  });

  // Check if Gist is configured
  const [gistConfigured, setGistConfigured] = useState(false);

  useEffect(() => {
    setGistConfigured(isGistConfigured());
  }, []);

  // Poll for sync state changes from Gist
    useEffect(() => {
    if (!gistConfigured) {
      console.warn('GitHub Gist not configured. Cross-device sync disabled.');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const state = await getSyncState();
        
        // Update pause state if changed
        if (state.paused !== pausedSync) {
          setPausedSync(state.paused);
          console.log('Pause state synced from Gist:', state.paused);
        }
        
        // Update intention state if changed
        if (state.intention !== intentionSync) {
          setIntentionSync(state.intention);
          console.log('Intention state synced from Gist:', state.intention);
        }
      } catch (error) {
        console.error('Failed to sync state from Gist:', error);
      }
    }, 500); // Poll every 500ms for faster sync
    
    return () => clearInterval(interval);
  }, [gistConfigured, pausedSync, intentionSync]);

  // Sync local state changes to Gist
    useEffect(() => {
    if (gistConfigured && name && condition !== null) {
      updateSyncState(paused, intention);
    }
  }, [paused, intention, name, condition, gistConfigured]);

  useEffect(() => {
    console.log('use effect condition, paused, generatePhrases, displayTranscript, prompt', condition, paused, generatePhrases, displayTranscript, prompt)
    // Declare a named function for the listener
    function messageListener(request, sender, sendResponse) {
      console.log(
        sender.tab
          ? 'from a content script:' + sender.tab.url
          : 'from the extension'
      );

      // Set new textbox
      const data = request.all;
      var cnt = data.length;
      var textbox = data[cnt - 1];

      if (Array.isArray(textbox)) {
        console.log("textbox is: " + textbox);
        const newTranscriptEle = {
          isAC: false,
          speaker: textbox[0],
          color: textbox[1],
          selected: false,
          message: textbox[2],
          timestamp: new Date().getTime(),
          timestampString: new Date().toString()
        };
        var newTranscript;
        // console.log(newTranscriptEle.color);
        // console.log(newTranscriptEle.speaker + ": " + newTranscriptEle.message);
        if (transcript.length === 0) {
          newTranscript = transcript.concat([newTranscriptEle]);
        } else if (transcript[transcript.length - 1].speaker === newTranscriptEle.speaker) {
          newTranscript = (transcript.slice(0, transcript.length - 1)).concat([newTranscriptEle])
        } else {
          newTranscript = transcript.concat([newTranscriptEle]);
        }
        setTranscript(newTranscript);
        setNewEle(newTranscriptEle);
        console.log('setting the prompt. displayTranscript', displayTranscript)
        setPrompt({
          prompt1: displayTranscript[displayTranscript.length - 2]?.message || '',
          prompt2: displayTranscript[displayTranscript.length - 1]?.message || ''
        })
        //console.log(transcript);
      }
      // console.log("not an array, skipping");
      // console.log('in messageListener condition', condition, 'paused', paused, 'generatePhrases', generatePhrases)
      // if (condition === 3 && paused && generatePhrases) {
      //   ChatbotApp3(prompt.prompt1, prompt.prompt2);
      // }
      sendResponse({ farewell: 'goodbye' });
    }
    //// Check if the listener is already added
    //if (chrome.runtime.onMessage.hasListener(messageListener)) {
    //  // Remove the existing listener
    //  chrome.runtime.onMessage.removeListener(messageListener)
    //}
    chrome.runtime.onMessage.addListener(messageListener)
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [condition, paused, generatePhrases, displayTranscript])

  useEffect(() => {
    console.log('in useEffect calling ChatbotApp. prompt', prompt)
    if (condition === 2 && paused && generatePhrases) {
      chatGPTService.getResponseForCondition2(prompt.prompt1, prompt.prompt2)
        .then(result => {
          setResponse(result);
          setGeneratePhrases(false);
        })
        .catch(error => {
          console.error('Error getting response:', error);
          setGeneratePhrases(false);
        });
    }
  }, [condition, paused, generatePhrases, prompt.prompt1, prompt.prompt2]);

  useEffect(() => {
    console.log('in useEffect calling ChatbotApp C3. prompt', prompt);
    if (condition === 3 && paused && intentionToGenerate) {
      chatGPTService.getResponseForIntention(prompt.prompt1, prompt.prompt2, intentionToGenerate)
        .then(result => {
          setIntentionResponses(prev => ({
            ...prev,
            [intentionToGenerate]: result
          }));
          setIntentionToGenerate(null);
        })
        .catch(error => {
          console.error('Error getting response:', error);
          setIntentionToGenerate(null);
        });
    }
  }, [condition, paused, intentionToGenerate, prompt.prompt1, prompt.prompt2]);
  /*
    useEffect(() => {
      if (isAAC) {
        syncTranscript(name, condition, transcript);
      }
    }, [name, condition, transcript, isAAC])
  */


  useEffect(() => {
    console.log('newEle', newEle)
    console.log(`paused: ${paused} generatePhrases: ${generateIntentPhrases}`)
    console.log('displayTranscript', displayTranscript)
    
    // Update transcript when newEle is available (content script already filters duplicates)
    if (newEle !== null) {
      var newTranscript;
      if (displayTranscript.length === 0) {
        newTranscript = displayTranscript.concat([newEle]);
      } else if (displayTranscript[displayTranscript.length - 1].speaker === newEle.speaker) {
        newTranscript = (displayTranscript.slice(0, displayTranscript.length - 1)).concat([newEle])
      } else {
        newTranscript = displayTranscript.concat([newEle]);
      }
      setDisplayTranscript(newTranscript);
      console.log('Transcript updated with new content from content script');
    }
  }, [newEle?.speaker, newEle?.message, newEle?.timestamp, paused, condition, generatePhrases]);

  // isAC: false,
  // speaker: textbox[0],
  // color: textbox[1],
  // selected: false,
  // message: textbox[2]

  // Sync paused state from AAC interface to pausedSync for CP interface
  useEffect(() => {
    if (isAAC === true) {
      setPausedSync(paused);
      console.log("Syncing paused state from AAC to CP:", paused);
    }
  }, [paused, isAAC]);

  return (
    <ThemeProvider theme={theme}>
      {isAAC != null && (
        <div className="BackButton">
          <IconButton
            onClick={(event) => {
              setName("");
              setIsAAC(null);
              setCondition(null);
            }}
          >
            <BackIcon />
          </IconButton>
        </div>
      )}
      {isAAC == null && (
        <Login
          //key={id}
          setName={setName}
          setIsAAC={setIsAAC}
          setCondition={setCondition}
          setVoiceChoice={setVoiceChoice}
          voiceChoice={voiceChoice}
        />
      )}
      {isAAC === true && condition === 1 && (
        <AACInterface1
          //key={id}
          name={name}
          transcript={displayTranscript}
          setTranscript={setDisplayTranscript}
          trueTranscript={transcript}
          setTrueTranscript={setTranscript}
          paused={paused}
          setPaused={setPaused}
          voiceChoice={voiceChoice}
        />
      )}
      {isAAC === true && condition === 2 && (
        <AACInterface2
          //key={id}
          name={name}
          condition={condition}
          transcript={displayTranscript}
          setTranscript={setDisplayTranscript}
          trueTranscript={transcript}
          setTrueTranscript={setTranscript}
          paused={paused}
          setPaused={setPaused}
          generatePhrases={generatePhrases}
          setGeneratePhrases={setGeneratePhrases}
          phrases={response}
          voiceChoice={voiceChoice}
        />
      )}
      {isAAC === true && condition === 3 && (
        <AACInterface3
          name={name}
          condition={condition}
          transcript={displayTranscript}
          setTranscript={setDisplayTranscript}
          trueTranscript={transcript}
          setTrueTranscript={setTranscript}
          paused={paused}
          setPaused={setPaused}
          intention={intention}
          setIntention={setIntention}
          setIntentionToGenerate={setIntentionToGenerate}
          intentionResponses={intentionResponses}
          voiceChoice={voiceChoice}
        />
      )}
      {isAAC === false && (
        <CPInterface
          //key={id}
          name={name}
          condition={condition}
          transcript={displayTranscript}
          intention={intention}
          pausedSync={pausedSync}
          intentionSync={intentionSync}
        />
      )}
    </ThemeProvider>
  );
};

export default Panel;