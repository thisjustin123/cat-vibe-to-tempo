var executed = false
function circularSetBpm(setBpm, bpm, timeout) {
  if (!executed) {
    setInterval(() => {
      const random = Math.random() * 170
      setBpm(random);
      console.log("Set bpm to " + random);
    }, timeout);
  }
}

export default circularSetBpm