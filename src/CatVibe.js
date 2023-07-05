import "./Giffer.css"
/*
Given:
  X Beats per minute.
  Y Beats per play (12).
Final Duration Computation:
  (Y / X) * 60 seconds.
*/

function CatVibe(props) {
  const durationString = (12 / parseFloat(props.bpm)) * 60 + "s";

  return <div className={(props.flip == "y") ? "giffer flip" : "giffer"} style={{ "--duration": durationString }}></div>;
}

export default CatVibe;