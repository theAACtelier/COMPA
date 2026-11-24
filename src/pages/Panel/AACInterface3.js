import "./styles.css";
import * as React from "react";
import {
  Button,
  ButtonGroup,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import { setIntentionPhraseClicked } from '../../firebase'

export default function AACInterface3({
  name, condition, transcript, setTranscript, trueTranscript, setTrueTranscript,
  paused, setPaused,
  intention, setIntention,
  intentionResponses,
  setIntentionToGenerate,
  voiceChoice }) {

  // Display transcript management (same as CP interface)
  const [displayTranscript, setDisplayTranscript] = React.useState([]);
  const [shouldUpdateTranscript, setShouldUpdateTranscript] = React.useState(false);

  // Displays phrases depending on which intention is chosen
  const [intentionPhraseKey, setIntentionPhraseKey] = React.useState('reply'); // 'reply', 'opinion', 'question', 'yesno'

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

  // Remove the duplicate storage and use the prop directly
  const intentionPhrasesAI = intentionResponses;

  React.useEffect(() => {
    console.log('Current phrases:', intentionPhrasesAI[intentionPhraseKey]);
  }, [intentionPhraseKey, intentionPhrasesAI]);

  React.useEffect(() => {
    console.log('Phrases updated:', {
      replies: intentionResponses.reply,
      opinions: intentionResponses.opinion,
      questions: intentionResponses.question,
      yesno: intentionResponses.yesno
    });
  }, [intentionResponses.reply, intentionResponses.opinion, intentionResponses.question, intentionResponses.yesno]);


  // inputContent contains the contents of the input text box.
  const [inputContent, setInputContent] = React.useState("");

  // Very hacky way to have the AAC composition message display correctly.
  let firstSelected = true;

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

  const handlePause = () => {
    setPaused(!paused);
    if (!paused) { // When pressing pause
      // Request phrases for current intention type
      setIntentionToGenerate(intentionPhraseKey);
    }
    // Note: selected property is now managed by Panel component
  }

  const handleSubmit = () => { // PRESS SUBMIT (PRESS PLAY)
    setPaused(false);
    if (!paused) {
      handlePause();
    }

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
      <div className="Transcript" style={{ height: "calc(100vh - 280px)" }}>
        <div style={{ maxHeight: "calc(100vh - 280px)", overflow: "auto" }}>
          {displayTranscript.map((entry, idx) => {
            let message = "";
            let colorflag = "";

            // Is this the first box?
            if ((entry.selected || paused) && firstSelected) {
              switch (intention) {
                case 0:
                  message = "You are replying to:";
                  colorflag = "blue";
                  break;
                case 1:
                  message = "You have an opinion about:";
                  colorflag = "#A72693";
                  break;
                case 2:
                  message = "You have a question about:";
                  colorflag = "seagreen";
                  break;
                case 3:
                  message = "You are deciding about:";
                  colorflag = "#E86A09";
                  break;
                default:
                  break;
              }
              firstSelected = false;
            }

            return (
              <div key={idx} className="MessageBox">
                <div
                  style={{ backgroundColor: (entry.selected || paused) && colorflag }} //flag color -"#311290"
                  className="Label"
                >
                  <b>{message}</b>
                </div>
                <div
                  style={{ backgroundColor: (entry.selected || paused) && "#65CBD3" }} //bookmark color
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
            className="TextField"
            id="outlined-multiline-static"
            multiline
            fullWidth
            inputProps={{ style: { color: "white" } }}
            minRows={1}
            maxRows={3}
            value={inputContent}
            onChange={(event) => {  //log any change?
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
        <ToggleButtonGroup
          style={{ backgroundColor: "#100742" }}
          value={intention}
          size="medium"
          onChange={(event, newIntention) => {
            if (newIntention != null) {
              setIntention(newIntention);
              const newIntentionType = (() => {
                switch (newIntention) {
                  case 0: return 'reply';
                  case 1: return 'opinion';
                  case 2: return 'question';
                  case 3: return 'yesno';
                  default: return 'reply';
                }
              })();
              setIntentionPhraseKey(newIntentionType);

              // Generate phrases for new intention if paused
              if (paused) {
                setIntentionToGenerate(newIntentionType);
              }
            }
          }}
          onClick={() => {
            if (!paused) {
              handlePause();
            }
          }}
          variant="contained"
          exclusive
          fullWidth
        >
          <ToggleButton value={0}>Reply</ToggleButton>
          <ToggleButton value={1}>Opinion</ToggleButton>
          <ToggleButton value={2}>Question</ToggleButton>
          <ToggleButton value={3}>Yes/No</ToggleButton>
        </ToggleButtonGroup>
        <ButtonGroup
          style={{ backgroundColor: "#302D40" }}
          size="medium"
          variant="text"
          fullWidth
          orientation="vertical"
        >
          {(() => {
            const phrases = intentionResponses[intentionPhraseKey] || [];
            if (phrases.length === 0) {
              return (
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
              );
            }

            return phrases.map((phrase, idx) => (
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
            ));
          })()}
        </ButtonGroup>
      </div>
    </div>
  );
}
