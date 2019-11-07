import React, { useState, useEffect } from 'react';
import { useHistory, RouteComponentProps } from 'react-router';
import * as Types from './types';
import firebase from './firebase';

interface Props extends RouteComponentProps<{ id: string }> {}

function Poll({ match }: Props) {
  const { id } = match.params;
  const history = useHistory();
  const [poll, setPoll] = useState<Types.Poll | null>(null);

  useEffect(() => {
    const pollRef = firebase
      .firestore()
      .collection('polls')
      .doc(id);

    async function checkPollExists() {
      const snapshot = await pollRef.get();
      const poll = snapshot.data();

      if (!poll) {
        history.replace('/404');
      }
    }

    checkPollExists();

    const unlisten = pollRef.onSnapshot(snapshot => {
      const poll = snapshot.data();
      if (!poll) return;
      setPoll(poll as Types.Poll);
    });
    return unlisten;
  }, [id]);

  return <pre>{JSON.stringify(poll, null, 2)}</pre>;
}

export default Poll;
