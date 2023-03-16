import './App.css';
import { useWhisper } from '@chengsokdara/use-whisper'
import {useState} from 'react';

const App = () => {

  const {
    recording,
    speaking,
    transcribing,
    transcript,
    pauseRecording,
    startRecording,
    stopRecording,

  } = useWhisper({
    apiKey: "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",
    streaming: true,
    timeSlice: 1_000, // 1 second
    removeSilence: true,
    whisperConfig: {
      language: 'en',
      prompt: "This is a lecture for class",


    },
  })

  const [summary, setSummary] = useState('');

  const generateNotes = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcript.text }),
      });
      console.log(transcript.text)
      if (response.ok) {
        const data = await response.json();
        const formattedNotes = data.summary
          .split('\n')
          .map((line, index) => <p key={index}>{line}</p>);
        setSummary(formattedNotes);
      } else {
        console.error("Failed to generate summary2");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  };

  return (
    <div className="app">
      <div className="status">
        <div className="status-items">
          <div className="status-item">
            <span
              className={`status-icon ${
                recording ? "status-green" : "status-red"
              }`}
            ></span>
            Recording
          </div>
          <div className="status-item">
            <span
              className={`status-icon ${
                speaking ? "status-green" : "status-red"
              }`}
            ></span>
            Speaking
          </div>
          <div className="status-item">
            <span
              className={`status-icon ${
                transcribing ? "status-green" : "status-red"
              }`}
            ></span>
            Transcribing
          </div>
        </div>
      </div>
      <div className="transcript">
        <h3>Lecture:</h3>
        <p>{transcript.text}</p>
      </div>
      <div className="controls">
        <button className="btn start" onClick={startRecording}>
          Start
        </button>
        <button className="btn pause" onClick={pauseRecording}>
          Pause
        </button>
        <button className="btn stop" onClick={stopRecording}>
          Stop
        </button>
      </div>
      <div className="center">
        <button className="btn generate" onClick={generateNotes}>
          Generate Notes
        </button>
      </div>
      <div className="notes">
        <h3>Notes:</h3>
        <div>{summary}</div>
      </div>
    </div>
  );
};
export default App;