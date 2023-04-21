import React, { useState, useEffect } from 'react';
import './NoteApp.css';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { saveNotes, loadNotes } from './localStorageUtils';
// import Settings from './components/Settings';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [notesLoaded, setNotesLoaded] = useState(false);

  useEffect(() => {
    if (!notesLoaded) {
      const storedNotes = loadNotes();
      setNotes(storedNotes);
      setNotesLoaded(true);
    }
  }, [notesLoaded]);
  
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);
  

  const handleSelectNote = (index) => {
    setSelectedNoteIndex(index);
  };

  const handleSaveNote = (noteWithTranscript) => {
    console.log("Saving note with transcript:", noteWithTranscript);
    const { title, content, note_transcript } = noteWithTranscript;
  
    const note = {
      title,
      content,
      note_transcript,
    };
  
    let updatedNotes;
    if (selectedNoteIndex !== null) {
      updatedNotes = [...notes];
      updatedNotes[selectedNoteIndex] = note;
    } else {
      updatedNotes = [...notes, note];
      setSelectedNoteIndex(notes.length);
    }
    
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };
  
  

  const [showSettings, setShowSettings] = useState(false); // Add state to handle the visibility of the Settings component
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("apiKey") || ""; // Load the API key from local storage if available
  });

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
const handleDeleteNote = (index) => {
    if (selectedNoteIndex !== null && selectedNoteIndex === index) {
      setSelectedNoteIndex(null);
    }

    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleNewNote = () => {
    const newNote = {
      title: 'New Note',
      content: '',
      note_transcript: '',
    };
    setNotes([...notes, newNote]);
    setSelectedNoteIndex(notes.length);
  };
  

  const selectedNote = selectedNoteIndex !== null ? notes[selectedNoteIndex] : null;

  return (
    <div className="App">
       {/* Add a button to toggle the Settings component */}
      <NoteList
        notes={notes}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onDelete={handleDeleteNote}
        showSettings={showSettings} // Pass showSettings
        toggleSettings={toggleSettings} // Pass toggleSettings
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedNoteIndex={selectedNoteIndex} // Pass selectedNoteIndex

      />
      <NoteEditor
        note={selectedNote}
        onSave={handleSaveNote}
        apiKey={apiKey}
        
      />
    </div>
  );
}

export default App;
