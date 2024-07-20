import React from 'react';
import PreferencesForm from './components/PreferencesForm';
import PlaylistGenerator from './components/PlaylistGenerator';
import LyricsTranslator from './components/LyricsTranslator';

const App = () => {
  return (
    <div>
      <h1>Multilingual Music Platform</h1>
      <PreferencesForm />
      <PlaylistGenerator />
      <LyricsTranslator />
    </div>
  );
};

export default App;
