import * as React from "react";
import {
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import WbSunnyTwoToneIcon from '@mui/icons-material/WbSunnyTwoTone';
import NightlightTwoToneIcon from '@mui/icons-material/NightlightTwoTone';

export default function Login({ setName, setIsAAC, setCondition, voiceChoice, setVoiceChoice }) {
  const [username, setUsername] = React.useState("");
  const [selectAAC, setSelectAAC] = React.useState(true);
  const [selectCondition, setSelectCondition] = React.useState(1);
  const [voices, setVoices] = React.useState([]);

  React.useEffect(() => {
    function loadVoices() {
      const voicesList = window.speechSynthesis.getVoices();
      setVoices(voicesList);
    }

    // Some browsers may not have voices immediately
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  var speakObj = new SpeechSynthesisUtterance();
  speakObj.text = "voice selected";
  speakObj.rate = 0.8;

  React.useEffect(() => {
    if (voiceChoice && voices.length > 0) {
      const speakObj = new SpeechSynthesisUtterance();
      speakObj.text = "voice selected";
      speakObj.rate = 0.8;
      speakObj.voice = voices.find(voice => voice.name === voiceChoice);
      window.speechSynthesis.speak(speakObj);
    }
  }, [voiceChoice, voices]);

  return (
    <div className="Login">

      <TextField
        value={username}
        size="small"
        id="name"
        label="Name"
        variant="filled"
        onChange={(event) => setUsername(event.target.value)}
      />
      {
        username.trim().length && <>
          <br />
          <br />
          <ToggleButtonGroup
            style={{ backgroundColor: "#100742" }}
            variant="contained"
            exclusive
            value={selectAAC}
            onChange={(event, isSelectAAC) => {
              if (isSelectAAC !== null) {
                setSelectAAC(isSelectAAC);
              }
            }}
          >
            <ToggleButton value={true}>AAC User</ToggleButton>
            <ToggleButton value={false}>Communication Partner</ToggleButton>
          </ToggleButtonGroup>
          <br />
          <br />

          <ToggleButtonGroup
            style={{ backgroundColor: "#100742" }}
            variant="contained"
            exclusive
            value={selectCondition}
            onChange={(event, whichCondition) => {
              if (whichCondition !== null) {
                setSelectCondition(whichCondition);
              }
            }}
          >
            <ToggleButton value={1}>Context Pause</ToggleButton>
            <ToggleButton value={2}>Context + AI Starters</ToggleButton>
            <ToggleButton value={3}>Context + Intent-Aware AI Starters</ToggleButton>
          </ToggleButtonGroup>
          <br />
          <br />


          {selectAAC ? (
            <div>
              <h1>Please select a voice</h1>
              <br />
              <ToggleButtonGroup
                style={{ backgroundColor: "#100742" }}
                variant="contained" //what is this?
                exclusive
                value={voiceChoice}
                onChange={(event, whichVoice) => {
                  if (whichVoice !== null) {
                    setVoiceChoice(whichVoice);
                    console.log("clicked on " + whichVoice);
                  }
                }}
              >
                <ToggleButton value={"Microsoft Zira - English (United States)"}> Moon <NightlightTwoToneIcon></NightlightTwoToneIcon> </ToggleButton>
                <ToggleButton value={"Microsoft Mark - English (United States)"}> Sun <WbSunnyTwoToneIcon></WbSunnyTwoToneIcon>  </ToggleButton>
              </ToggleButtonGroup>
            </div>


          ) : (
            <h1>You will view the app as a communication partner</h1>
          )
          }
          <br />
          <br />
          <Button
            onClick={() => {
              setIsAAC(selectAAC);
              setCondition(selectCondition);
              setName(username);
            }
            }
          >Start
          </Button>


        </>
      }
    </div>



  );
}
