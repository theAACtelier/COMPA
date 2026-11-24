import "./styles.css";
import * as React from "react";
import { Button, ButtonGroup, IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import { setIntentionPhraseClicked } from '../../firebase'

export default function AACInterface2({ name, condition, transcript, setTranscript, trueTranscript, setTrueTranscript, paused, setPaused, generatePhrases, setGeneratePhrases, phrases, voiceChoice }) {
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

  // Very hacky way to have the AAC composition message display correctly.
  let firstSelected = true;

  // This makes it so new messages appear in view.
  const ScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  const textBox = React.useRef();

  // Text-to-speech setup
  let voices = [];
  const synth = window.speechSynthesis;
  voices = synth.getVoices();

  const handlePause = () => {
    // pauses transcript

    //when the user pauses the transcript that is when I want to call on chatGPT

    console.log("generate phrases in c2 is " + generatePhrases);


    console.log("paused: " + paused);
    setPaused(!paused);
    setGeneratePhrases(true);
    console.log("flag in C2 is *** " + generatePhrases);

    // Note: selected property is now managed by Panel component
  }

  const handleSubmit = () => { // PRESS SUBMIT (PRESS PLAY)
    setPaused(false);
    setGeneratePhrases(!generatePhrases);

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

      setInputContent("");
      // Need to be able to send msg to server to let it know transcript has changed here.
    }
  }

  return (
    <div className="Interface">
      <div className="Transcript" style={{ height: "calc(100vh - 225px)" }}>
        <div style={{ maxHeight: "calc(100vh - 225px)", overflow: "auto" }}>
          {displayTranscript.map((entry, idx) => {
            let message = "";

            // Is this the first box?
            if ((entry.selected || paused) && firstSelected) {
              message = "You are typing about: ";
              firstSelected = false;
            }


            return (
              <div key={idx} className="MessageBox">
                <div
                  style={{ backgroundColor: (entry.selected || paused) && "blue" }} //color for the flag - #311290
                  className="Label"
                >
                  <b>{message}</b>
                </div>
                <div
                  style={{ backgroundColor: (entry.selected || paused) && "#65CBD3" }}
                ></div>
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
        <div className="TextInput">

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
            ref={textBox}
            className="TextField"
            multiline
            fullWidth
            inputProps={{ style: { color: "white" } }}
            minRows={1}
            maxRows={3}
            value={inputContent}
            onChange={(event) => {
              setInputContent(event.target.value);
              if (!paused) {
                handlePause();
              }
            }}
            onFocus={() => {
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
        <ButtonGroup
          style={{ backgroundColor: "#302D40" }}
          size="medium"
          variant="text"
          fullWidth
          orientation="vertical"
        >
          {phrases.length === 0 ? (
            <Button
              disabled
              style={{
                textTransform: "none",
                color: "gray",
                justifyContent: "left"
              }}
            >
              No suggestions available
            </Button>
          ) : (
            phrases.map((phrase, idx) => (
              <Button
                key={phrase}
                style={{
                  textTransform: "none",
                  color: "white",
                  justifyContent: "left"
                }}
                value={phrase}
                onClick={() => setInputContent(inputContent + phrase)}
              >
                {phrase}
              </Button>
            ))
          )}
        </ButtonGroup>
      </div>
    </div>
  );
}
