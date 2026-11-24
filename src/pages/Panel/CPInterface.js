import "./styles.css";
import React, { useState, useEffect } from "react";

export default function CPInterface({
  name,
  condition,
  transcript,
  pausedSync,
  intentionSync
}) {
  const [displayTranscript, setDisplayTranscript] = useState([])
  const [shouldUpdateTranscript, setShouldUpdateTranscrtipt] = useState(false)

  useEffect(() => {
    if (pausedSync === true) {
      if (shouldUpdateTranscript === true) {
        setDisplayTranscript([
          ...transcript.slice(0, transcript.length - 1),
          {
            ...transcript[transcript.length - 1],
            selected: true,
          }
        ])
        setShouldUpdateTranscrtipt(false)
      }
    } else {
      setDisplayTranscript(transcript)
      setShouldUpdateTranscrtipt(true)
    }
  }, [transcript, pausedSync, shouldUpdateTranscript])

  // This makes it so new messages appear in view.
  const ScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  const getIntentionMessage = () => {
    if (!condition || condition === 1) return "AAC user is typing...";

    if (condition === 2) return "AAC user is typing about: ";

    if (condition === 3) {
      switch (intentionSync) {
        case 0: return "AAC user is replying to:";
        case 1: return "AAC user has an opinion about: ";
        case 2: return "AAC user has a question about:";
        case 3: return "AAC user is deciding about: ";
        case 4: return "AAC user is referring to: ";
        default: return "";
      }
    }
    return "";
  };

  const getIntentionColor = () => {
    if (!condition || condition === 1 || condition === 2) return "blue";

    if (condition === 3) {
      switch (intentionSync) {
        case 0: return "blue";
        case 1: return "#A72693";
        case 2: return "seagreen";
        case 3: return "#E86A09";
        case 4: return "blue";
        default: return "";
      }
    }
    return "";
  };

  const isCondition1 = condition === 1;
  const transcriptHeight = isCondition1 && displayTranscript.length > 0 && displayTranscript[displayTranscript.length - 1].selected
    ? "calc(100vh - 80px)"
    : "100vh";

  return (
    <div className="Interface">
      <div className="Transcript" style={{ height: transcriptHeight }}>
        <div style={{ maxHeight: transcriptHeight, overflow: "auto" }}>
          {displayTranscript.map((entry, idx) => (
            <div
              key={idx}
              className={isCondition1 ? undefined : "MessageBox"}
              style={isCondition1 ? { marginLeft: 40, marginRight: 40 } : undefined}
            >
              {!isCondition1 && (
                <>
                  <div
                    style={{ backgroundColor: entry.selected && getIntentionColor() }}
                    className="Label"
                  >
                    {entry.selected && pausedSync && <b>{getIntentionMessage()}</b>}
                  </div>
                  <div
                    style={{
                      backgroundColor: entry.selected ? "#65CBD3" : undefined,
                      width: "15px",
                      height: "100%"
                    }}
                  ></div>
                </>
              )}
              <div
                className={name === entry.speaker ? "YourMessage" : "Message"}
              >
                <strong style={{ color: entry.color }}>
                  {name === entry.speaker ? "You" : entry.speaker}
                  {entry.isAC ? " (AAC User)" : ""}
                </strong>
                <div className={entry.isAC ? "ACText" : "Text"}>
                  {entry.message}
                </div>
              </div>
            </div>
          ))}
          <ScrollToBottom />
        </div>
      </div>
      {isCondition1 && displayTranscript.length > 0 && displayTranscript[displayTranscript.length - 1].selected && (
        <div style={{ height: '80px', backgroundColor: 'blue', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#FFFFFF' }}>
          <b>{getIntentionMessage()}</b>
        </div>
      )}
    </div>
  );
}
