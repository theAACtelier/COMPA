import "./styles.css";
import * as React from "react";
import { IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";


export default function AACInterface1({ name, transcript, setTranscript, trueTranscript, setTrueTranscript, paused, setPaused, voiceChoice }) {
  // inputContent contains the contents of the input text box.
  const [inputContent, setInputContent] = React.useState("");

  // Display transcript management (same as CP interface)
  const [displayTranscript, setDisplayTranscript] = React.useState([]);
  const [shouldUpdateTranscript, setShouldUpdateTranscript] = React.useState(false);

  // Display transcript management logic (same as CP interface)
  React.useEffect(() => {
    if (paused === true) {
      if (shouldUpdateTranscript === true) {
        setDisplayTranscript([
          ...transcript.slice(0, transcript.length - 1),
          {
            ...transcript[transcript.length - 1],
            selected: true,
          }
        ]);
        setShouldUpdateTranscript(false);
      }
    } else {
      setDisplayTranscript(transcript);
      setShouldUpdateTranscript(true);
    }
  }, [transcript, paused, shouldUpdateTranscript]);

  //const [voiceAAC, setVoiceAAC] = React.useState(voiceChoice);


  // This makes it so new messages appear in view.
  const ScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  // Text-to-speech setup
  let voices = [];
  const synth = window.speechSynthesis;
  voices = synth.getVoices();


  //var speakObj = new SpeechSynthesisUtterance();
  //speakObj.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name === voiceChoice })[0];
  //speakObj.rate = 0.9;
  console.log("voice in C1 is " + voiceChoice);

  const handlePause = () => {
    // pauses transcript
    console.log("paused: " + paused);
    setPaused(!paused);
    // Note: selected property is now managed by display transcript logic
  }

  const handleSubmit = () => { // PRESS SUBMIT (PRESS PLAY)
    setPaused(false);

    let newTranscript = [
      ...transcript.slice(0, transcript.length - 1),
      {
        ...transcript[transcript.length - 1],
        selected: false,
      }
    ];

    if (inputContent !== "") {
      const newMsg = {
        isAC: true,
        speaker: name,
        color: "#A6EFE4",
        selected: false,
        message: inputContent
      };
      setTranscript([...newTranscript, newMsg]);
      setTrueTranscript([...trueTranscript, newMsg]);

      // Speak the inputted text

      const utterThis = new SpeechSynthesisUtterance();
      utterThis.text = inputContent;
      utterThis.rate = 0.8;
      //with voiceChoice
      if (voiceChoice !== "") {
        for (let i = 0; i < voices.length; i++) {
          if (voices[i].name === voiceChoice) {
            utterThis.voice = voices[i];
          }
        }
      } else {
        for (let i = 0; i < voices.length; i++) {
          if (voices[i].name === "Fred") {
            utterThis.voice = voices[i];
          }
        }
      }
      synth.speak(utterThis);


      console.log("speaking in this voice " + voiceChoice);
      //speakObj.text = inputContent;

      setInputContent("");
      // Need to be able to send msg to server to let it know transcript has changed here.


    }
  }

  return (
    <div className="Interface">
      <div className="Transcript" style={{ height: "calc(100vh - 80px)" }}>
        <div style={{ maxHeight: "calc(100vh - 80px)", overflow: "auto" }}>
          {displayTranscript.map((entry, idx) => {

            return (
              <div key={idx} style={{ marginLeft: 40, marginRight: 40 }}>
                {!entry.isAC && (
                  <div
                    className={
                      name === entry.speaker ? "YourMessage" : "Message"
                    }
                  >
                    <strong style={{ color: entry.color }}>
                      {name === entry.speaker ? "You" : entry.speaker}
                    </strong>
                    <div className="Text">{entry.message}</div>
                  </div>
                )}
                {entry.isAC && (
                  <div
                    className={
                      name === entry.speaker ? "YourMessage" : "Message"
                    }
                  >
                    <strong style={{ color: entry.color }}>
                      {name === entry.speaker ? "You" : entry.speaker} (AAC
                      User)
                    </strong>
                    <div className="ACText">{entry.message}</div>
                  </div>
                )}
              </div>
            );
          })}
          <ScrollToBottom />
        </div>
      </div>
      <div className="Input">
        <div className="TextInput1">
          <div className="SubmitButtonContainer">
            <IconButton
              className="SubmitButton"
              style={{ alignItems: "center" }}
              onClick={handlePause}
            >
              {paused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
          </div>
          <TextField
            className="TextField"
            id="outlined-multiline-static"
            multiline
            fullWidth
            inputProps={{ style: { color: "white" } }}
            minRows={1}
            maxRows={3}
            value={inputContent}
            onFocus={() => {
              if (!paused) {
                handlePause();
              }
            }}
            onChange={(event) => {
              setInputContent(event.target.value);
              console.log("aac user is typing");
              if (!paused) {
                handlePause();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSubmit()
              }
            }}
          />
          <div className="SubmitButtonContainer">
            <IconButton
              className="SubmitButton"
              onClick={handleSubmit}
            >
              <SendIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
