var transcript = '';
var lasttext = '';
var qarray = [];
var messagesent = '';
var speaker = '';
var premessage = '';
var pastmessage = '';
var value = { past: '' };
var allmessages = [];
var cnt = 0;
var colordict = {};
var colors = ['#FF0266', '#BDC0FF', '#EB4034', '#34EB98', '#4C34EB', '#E834EB', '#34EBB7', '#49EB34', '#EB3446', '#E5EB34', '#34E5EB', '#E28743', '#ABDBE3', '#CDCCC8', '#DAF2F1'];
var colorsused = 0;
var fullTranscript = '';
var lastTranscript = '';

console.log('Google Meet Transcript Extension');

//chrome.runtime.onConnect.addListener(function (port) {
//  console.assert(port.name === 'knockknock');
//
//  function attemptSend() {
//    try {
//      port.postMessage(transcript);
//      console.log('Message sent successfully');
//    } catch (err) {
//      console.log('Receiver not ready, retrying in 1 second...');
//      setTimeout(attemptSend, 1000);
//    }
//  }
//
//  attemptSend();
//
//  port.onMessage.addListener(function (msg) {
//    console.log('retrieveTranscript.js: received ', msg);
//  });
//});

function strComp(stringA, stringB) {
  var firstOccurrence = stringB.indexOf(stringA);

  if (firstOccurrence === -1) {
    return stringB;
  } else {
    var stringALength = stringA.length;
    var newString;

    if (firstOccurrence === 0) {
      newString = stringB.substring(stringALength);
    } else {
      newString = stringB.substring(0, firstOccurrence);
      newString += stringB.substring(firstOccurrence + stringALength);
    }

    return newString;
  }
}

function check() {
  var captions = document.querySelectorAll('[class="ygicle VbkSUe"]');
  var caption = captions.length > 0 ? captions[captions.length - 1] : null;
  if (caption !== null) {
    var nameContainers = document.querySelectorAll('[class="NWpY1d"]');
    // Print all found speaker name elements and their text
    console.log('Speaker name elements:', Array.from(nameContainers).map(e => e.textContent));
    var nameContainer = nameContainers.length > 0 ? nameContainers[nameContainers.length - 1] : null;
    var name = 'Speaker';
    if (nameContainer !== null) {
      name = nameContainer.textContent;
    }
    var text = '';
    text += caption.textContent;
    if (text != '' && text !== lastTranscript) {
      lastTranscript = text;
      messagesent = text;
      console.log("Who's speaker? " + speaker);

      // Starting conversation
      if (speaker === '') {
        speaker = name;
        console.log('Speaker is now' + speaker);
        colordict[speaker] = colors[colorsused];
        colorsused++;
        allmessages[cnt] = [speaker, colordict[speaker], text];
      }
      // New Speaker
      else if (name !== speaker) {
        speaker = name;
        cnt++;
        if (speaker in colordict) {
          allmessages[cnt] = [speaker, colordict[speaker], text];
        } else {
          colordict[speaker] = colors[colorsused];
          colorsused++;
          allmessages[cnt] = [speaker, colordict[speaker], text];
        }
      }
      // Same Speaker
      else {
        speaker = name;
        allmessages[cnt] = [speaker, colordict[speaker], text];
      }
      console.log(name + ' said: ' + text);

      try {
        sendMessageWithRetry({
          newtext: text,
          all: allmessages
        });
      } catch (err) {
        console.log('Error:', err);
      }
    }
  }
  setTimeout(check, 200);
}

function isValidMessage(message) {
  // Example: Only allow printable characters and basic HTML tags
  return /^[\x20-\x7E<br>]*$/.test(message);
}

let lastSentMessage = '';

function sendMessageWithRetry(message) {
  // Debug logs to see what's happening
  // console.log('New message:', JSON.stringify(message.newtext));
  //console.log('Last sent message:', JSON.stringify(lastSentMessage));
  //console.log('Are they different?', message.newtext !== lastSentMessage);

  // Only send if the message is valid and different from last sent
  if (
    isValidMessage(message.newtext) &&
    (message.newtext !== lastSentMessage)
  ) {
    chrome.runtime.sendMessage(message, function (response) {
      if (chrome.runtime.lastError) {
        console.log('Receiver not ready, retrying in 1 second...');
        setTimeout(() => sendMessageWithRetry(message), 1000);
      } else {
        lastSentMessage = message.newtext;
        console.log('Message sent successfully:', response);
      }
    });
  } else {
    console.log('Skipped sending invalid or duplicate/shorter message');
  }
}

check();

// if (transcript.length > 10) {
//   var blob = new Blob([transcript], {
//     type: 'text/plain;charset=utf-8',
//   });
//   saveAs(blob, 'test.txt');
// }