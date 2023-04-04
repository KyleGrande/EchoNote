import './App.css';
import { useWhisper } from '@chengsokdara/use-whisper'
import {useState, useRef, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';

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

  //const [summary, setSummary] = useState('');  v1
  const [summary, setSummary] = useState([]);
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
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [recording]);

  const handleStartRecording = () => {
    if (!recording) {
      setTimer(0);
      startRecording();
      
    } else {
      pauseRecording();
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  

  return (
    <div className="app">
      <div className="status">
        <div className="status-items">
        <div className="status-item">
        <span className="status-label">Timer:</span>
        <span className="status-value">{formatTime(timer)}</span>
      </div>
          <div className="status-item">
            <span
              className={`status-icon ${
                recording ? "status-green" : "status-red"
              }`}
            ></span >
            <span className="status-label">Recording</span>
            
          </div>
          <div className="status-item">
            <span
              className={`status-icon ${
                speaking ? "status-green" : "status-red"
              }`}
            ></span>
            <span className="status-label">Speaking</span>
          </div>
          <div className="status-item">
            <span
              className={`status-icon ${
                transcribing ? "status-green" : "status-red"
              }`}
            ></span>
            <span className="status-label">
            Transcribing
            </span>
          </div>
        </div>
      </div>
      <div className="transcript">
        <h3>Lecture:</h3>
        <p>{transcript.text}</p>
      </div>
      <div className="controls">
        <button className="btn start" onClick={handleStartRecording}>
          {recording ? 'Pause' : 'Start'}
        </button>
        
        <button className="btn stop" onClick={handleStopRecording}>
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
        <div>
          {/* {summary} v1 */}
        {summary.map((note, index) => (
            <ReactMarkdown key={index}>{note.props.children}</ReactMarkdown>
          ))}
        </div>
      </div>
    </div>
  );
};
export default App;