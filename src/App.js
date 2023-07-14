import CatVibe from './CatVibe.js'
import './App.css';
import React, { useState } from 'react';
import circularSetBpm from './Bpm.js'
import MusicTempo from 'music-tempo'
import { Buffer } from 'buffer';

var set = false;
var prevBpm = 174;
var interval = 8000;
var intervalBuffer = 4000;
var multiplier = 1.09
var flag = .05

const MicRecorder = require('mic-recorder-to-mp3');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const recorder = new MicRecorder({
  bitRate: 64,
  startRecordingAt: 0,
});

function App() {
  const [bpm, setBpm] = useState(prevBpm);
  // If -1, don't render. Otherwise, render.
  const [justSetTempo, setJustSetTempo] = useState(-1);
  const [clicked, setClicked] = useState(false);
  const [permissionsBlock, setPermissionsBlock] = useState(false);

  function doRecording() {
    console.log("Recording start...")
    // Start Recording.
    recorder.start().then(() => {
    }).catch((e) => {
      console.error(e);
    });

    // Stop recording after time.
    setTimeout(() => {
      console.log("Stopping recording...");
      // Stop Recording.
      recorder.stop().getMp3().then(
        ([buffer, blob]) => {

          // Uncomment to listen.
          // const file = new File([blob], 'me-at-thevoice.mp3', {
          //   type: blob.type,
          //   lastModified: Date.now()
          // });

          // const player = new Audio(URL.createObjectURL(file));
          // player.play()


          blob.arrayBuffer().then((arr) => {
            audioContext.decodeAudioData(arr).then(
              (audioBuffer) => {
                setPermissionsBlock(false)

                //console.log("Audio Buffer Duration: " + audioBuffer)
                const floatArr = new Float32Array(audioBuffer.length)
                audioBuffer.copyFromChannel(floatArr, 0)
                const mt = new MusicTempo(audioBuffer.getChannelData(0))

                // Tempo & Adjusted Tempo
                const tempo = mt.tempo
                const tempoAdjusted = mt.tempo * multiplier
                console.log("Normal Tempo: " + tempo + "\t Adjusted " + multiplier + "x: " + tempoAdjusted)

                // Only change Bpm if it's over [flag] different.
                const change = (tempoAdjusted - prevBpm) / prevBpm
                console.log("That's a change of " + change * 100 + "% from a previous bpm of " + prevBpm)
                if (Math.abs(change) > flag) {
                  prevBpm = tempoAdjusted
                  setBpm(tempoAdjusted)

                  setJustSetTempo(tempoAdjusted)
                  setTimeout(() => { setJustSetTempo(-1) }, 2500)
                }
                else {
                  console.log("Change is less than " + flag + ". Ignoring...")
                }
              }
            )
              // Could not decode audio -- usually due to permissions.
              .catch((e) => {
                console.log("Permissions not yet granted.")
                setPermissionsBlock(true)
                setTimeout(() => { setPermissionsBlock(false) }, 3000)
              })
          })
        }
      ).catch((e) => {
        console.log("Error Occurred: " + e);
      });
    }, interval - intervalBuffer)
  }

  function Start() {
    if (!set) {
      setClicked(true);
      setTimeout(doRecording, 2000)
      setTimeout(() => { setInterval(doRecording, interval); }, 3000)
      set = true;
    }
  }

  return (
    <div className="App">
      <ul style={{ display: 'table', width: '100vw', boxSizing: 'border-box', padding: 0 }} onClick={Start}>
        <li className="horiz"><CatVibe bpm={bpm + ""}></CatVibe></li>
        <li className="horiz" style={{ width: "20%" }}></li>
        <li className="horiz"><CatVibe bpm={bpm + ""} flip="y"></CatVibe></li>
      </ul>
      {!clicked &&
        <div id="text">Click to Start Recording Tempo</div>
      }
      {permissionsBlock &&
        <div id="text" style={{ color: "rgba(255, 0, 0, .7)" }}>Microphone Permissions Not Granted. Retrying...</div>
      }
      {justSetTempo >= 0 &&
        <div id="text" style={{ color: "rgba(255, 255, 255, .4)" }}>
          {justSetTempo.toFixed(0) + " BPM"}
        </div>
      }
    </div>
  );
}

export default App;
