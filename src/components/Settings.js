import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ apiKey, setApiKey }) => {
  const [tempKey, setTempKey] = useState(apiKey);

  const handleChange = (e) => {
    setTempKey(e.target.value);
  };

  const handleSave = () => {
    setApiKey(tempKey);
    localStorage.setItem('apiKey', tempKey);
  };

  return (
    <div className="settings">
      <label htmlFor="api-key"><a href='https://platform.openai.com/account/api-keys'>OpenAI </a>API KEY</label>
      <input type="text" id="api-key" value={tempKey} onChange={handleChange} />
      <button onClick={handleSave}>Save</button>
      <p className='safety'>We prioritize your data security by keeping your information locally stored and using secure, encrypted connections to OpenAI services. You can use our app with confidence, knowing that your notes and API key are safe and secure.</p>
    </div>
  );
};

export default Settings;
