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
                }
                else {
                  console.log("Change is less than " + flag + ". Ignoring...")
                }
              }
            )
          })
        }
      ).catch((e) => {
        console.log("Error Occurred: " + e);
      });
    }, interval - intervalBuffer)
  }

  React.useEffect(() => {
    if (!set) {
      setTimeout(doRecording, 2000)
      setTimeout(() => { setInterval(doRecording, interval); }, 3000)
      set = true;
    }
  })

  return (
    <div className="App">
      <ul style={{ display: 'table', width: '100vw', boxSizing: 'border-box', padding: 0 }}>
        <li className="horiz"><CatVibe bpm={bpm + ""}></CatVibe></li>
        <li className="horiz" style={{ width: "20%" }}></li>
        <li className="horiz"><CatVibe bpm={bpm + ""} flip="y"></CatVibe></li>
      </ul>
    </div>
  );
}

export default App;
