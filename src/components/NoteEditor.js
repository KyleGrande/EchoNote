import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWhisper } from '@chengsokdara/use-whisper';
import ReactMarkdown from 'react-markdown';
import { Configuration, OpenAIApi } from 'openai';


const NoteEditor = ({ note, onSave, apiKey }) => {
  const {
    recording,
    speaking,
    transcribing,
    transcript,
    pauseRecording,
    startRecording,
    stopRecording,
  } = useWhisper({
    apiKey: apiKey ||'apiKey',
    noteTranscript: note ? note.note_transcript : '',
    streaming: true,
    timeSlice: 1_000, // 1 second
    removeSilence: true,
    whisperConfig: {
      language: 'en',
      prompt: "This is a lecture for class",
    },
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [isTextarea, setIsTextarea] = useState(true);
  const [generateNotesEnabled, setGenerateNotesEnabled] = useState(false);

  const toggleEditor = () => {
    setIsTextarea(!isTextarea);
  };

  const toggleGenerateNotes = () => {
    setGenerateNotesEnabled(!generateNotesEnabled);
  };
  
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

useEffect(() => {
  setTitle(note ? note.title : '');
  setContent(note ? note.content : '');
  setTranscriptText(note ? note.note_transcript: '');
}, [note]);

// useEffect(() => {
//   setTranscriptText(transcript.text);
// }, [transcript.text]);
// ...
// Line 62



const generateNotesButton = async () => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `You are a note taker during a lecture. You take excellent notes in markdown format. You start with a title and always emphasize dates and deadlines and material (for assignments and test ect). Do not add your own information, only use the transcript.\n\n${transcript.text}`,
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log(transcript.text);

    if (response.status === 200) {
      const data = response.data.choices[0].text.trim();
      const formattedNotes = data
        .split('\n')
        .map((line, index) => <p key={index}>{line}</p>);
      setSummary(formattedNotes);
      updateContentWithSummary();
      setTranscriptText(transcript.text);
    } else {
      console.error('Failed to generate summary2');
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
};

//stream v1
// const generateNotes = async () => {
//   openai
//     .createCompletion({
//       model: 'text-davinci-003',
//       prompt: `You are a note taker during a lecture. You take excellent notes in markdown format. You start with a title and always emphasize dates and deadlines and material (for assignments and test ect). Do not create anything only use the words given\n\n${transcript.text}`,
//       temperature: 0.3,
//       max_tokens: 200,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//     })
//     .then((response) => {
//       if (response.status === 200) {
//         const data = response.data.choices[0].text.trim();
//         const formattedNotes = data
//           .split('\n')
//           .map((line, index) => <p key={index}>{line}</p>);
//         setSummary(formattedNotes);
//         updateContentWithSummary();
//         setTranscriptText(transcript.text);
//       } else {
//         console.error('Failed to generate summary2');
//       }
//     })
//     .catch((error) => {
//       console.error('Error generating summary:', error);
//     });
// };
const lastSummaryTokenRef = useRef(null); // Add this ref to store the last summary token

const generateNotes = async () => {
  openai
    .createCompletion({
      model: 'text-davinci-003',
      prompt: `You are a note taker during a lecture. You take excellent notes in markdown format. You start with a title and always emphasize dates and deadlines and material (for assignments and test ect). Do not create additional information only use information given.\n\n${transcript.text}`,
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    .then((response) => {
      if (response.status === 200) {
        const data = response.data.choices[0].text.trim();
        const summaryToken = data.slice(-1); // Get the last character as a token

        if (summaryToken !== lastSummaryTokenRef.current) {
          lastSummaryTokenRef.current = summaryToken;
          const formattedNotes = data
            .split('\n')
            .map((line, index) => <p key={index}>{line}</p>);
          setSummary(formattedNotes);
          updateContentWithSummary();
          setTranscriptText(transcript.text);
        }
      } else {
        console.error('Failed to generate summary2');
      }
    })
    .catch((error) => {
      console.error('Error generating summary:', error);
    });
};



const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const debouncedGenerateNotes = useCallback(debounce(generateNotes, 5000), [transcript.text]); // 5 seconds debounce, added useCallback

useEffect(() => {
  setTranscriptText(transcript.text);
  if (generateNotesEnabled) {
    debouncedGenerateNotes();
  }
}, [transcript.text, generateNotesEnabled]); // Removed debouncedGenerateNotes from the dependency array


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

  // const updateContentWithSummary = () => {
  //   setContent((prevContent) => prevContent + summary.map((note) => note.props.children).join('\n'));
  // };
  const updateContentWithSummary = () => {
    setContent(summary.map((note) => note.props.children).join('\n'));
  };
  
  
  

  const handleSave = () => {
    onSave({ title, content, note_transcript: transcriptText });
  };
  

  if (!note) {
    return <div className="note-echo">Welcome to EchoNote.<br></br> Your AI powered notetaker.</div>;
  }

  return (
    <div className="note-editor">
      {/* AI-powered note-taking functionality */}
      <div className="ai-note-taking">
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
          <div className="status-btns">
          <div className="status-item status-btn">
            <button className={recording ? 'pause' : 'start'} onClick={handleStartRecording}>
            {recording ? 'Pause' : 'Start'}
          </button>
          </div>
          <div className="status-item status-btn">
  <button onClick={toggleGenerateNotes}>
    {generateNotesEnabled ? "Disable Auto-Generate" : "Enable Auto-Generate"}
  </button>
</div>


          <div className="status-item status-btn">
          <button className="generate" onClick={generateNotesButton}>
            Generate
          </button>
          </div>
          <div className='status-item status-btn'>
          <button onClick={toggleEditor}>
        {isTextarea ? "Markdown" : "Edit"}
      </button>
      </div>
<div className='status-item status-btn'>
          <button onClick={handleSave}>Save</button>
      {/* <button onClick={handleDelete}>Delete</button> */}
      </div>
      <div className="status-item status-btn">

<button className="stop" onClick={handleStopRecording}>Stop</button>
</div>
        </div>
        
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <div className="transcript">
      <textarea
  value={recording ? transcript.text : transcriptText}
  placeholder="Transcription"
  readOnly
  style={{ resize: "vertical", width: "100%" }}
  />

      {/* <textarea value={transcript.text} placeholder="Transcription" readOnly /> */}
      </div>
        <div className="controls">

        </div>
      </div>
      {/* <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note content"
      />
      <ReactMarkdown
        className="markdown-editor"
        children={content}

      /> */}
      {isTextarea ? (
        <textarea
        className="my-note-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Notes"
          style={{ resize: "vertical", width: "100%" }}

        />
      ) : (
        <ReactMarkdown className="markdown-editor" children={content} />
      )}
    </div>
  );
};

export default NoteEditor;
