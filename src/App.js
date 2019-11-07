import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import firebase from './firebase';

function App() {
  const [data, setData] = useState(null);
  useEffect(() => {
    async function test() {
      const thingRef = firebase
        .firestore()
        .collection('stuff')
        .doc('thing');

      const shapshot = await thingRef.get();
      const data = shapshot.data();
      setData(data);
    }

    test();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </header>
    </div>
  );
}

export default App;
