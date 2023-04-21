import React from 'react';
import Settings from './Settings';


const NoteList = ({
  notes,
  onSelectNote,
  onNewNote,
  onDelete,
  showSettings,
  toggleSettings,
  apiKey,
  setApiKey,
  selectedNoteIndex,
}) => {
  console.log("Notes in NoteList:", notes);

  const handleDelete = (index, e) => {
    e.stopPropagation(); // Prevent click event from propagating to the parent element
    onDelete(index);
  };

  return (
    <div className="note-list">
      <button onClick={onNewNote} className="new-note-button">
        Create Note
      </button>
      <div className="note-items">
        {notes.map((note, index) => (
          <div
            key={index}
            className={`note-item${index === selectedNoteIndex ? " selected" : ""}`} // Use selectedNoteIndex instead of onSelectNote
            onClick={() => onSelectNote(index)}
          >
            {note.title}
            <button onClick={(e) => handleDelete(index, e)}>X</button> 
          </div>
        ))}
      </div>
      <button onClick={toggleSettings} className="settings-btn">
        Settings
      </button>
      {showSettings && <Settings apiKey={apiKey} setApiKey={setApiKey} />}
    </div>
  );
};

export default NoteList;
