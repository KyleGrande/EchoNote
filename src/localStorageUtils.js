const NOTES_KEY = 'note-taking-app-notes';

export function saveNotes(notes) {
    console.log("Saving notes:", notes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
  
  export function loadNotes() {
    const notesJSON = localStorage.getItem(NOTES_KEY);
    const loadedNotes = notesJSON ? JSON.parse(notesJSON) : [];
    console.log("Loaded notes:", loadedNotes);
    return loadedNotes;
  }
  
