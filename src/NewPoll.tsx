import React, { useState } from 'react';
import * as Types from './types';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, TextField, Button, Divider, CircularProgress } from '@material-ui/core';
import shortId from 'shortid';
import firebase from './firebase';
import userId from './userId';
import SortableChoices from './SortableChoices';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  title: {
    margin: theme.spacing(0, 1),
    marginBottom: theme.spacing(2),
  },
  instructions: {
    margin: theme.spacing(0, 1),
    marginBottom: theme.spacing(2),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
  makePoll: {
    alignSelf: 'flex-end',
    minWidth: 112,
  },
}));

function NewPoll() {
  const classes = useStyles();
  const history = useHistory();
  const [choices, setChoices] = useState([] as string[]);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const disabled = !name || !question || choices.filter(x => !!x).length <= 1;

  const handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
  };

  const handleMakePoll = async () => {
    try {
      setLoading(true);

      const poll: Types.Poll = {
        id: shortId(),
        question,
        ownerId: userId(),
        // type:
        options: choices
          .filter(Boolean)
          .map(choice => choice.trim())
          .map((choice, index) => ({
            id: shortId(),
            label: choice,
            position: index,
          }))
          .reduce(
            (options, choice) => {
              options[choice.id] = choice;
              return options;
            },
            {} as any,
          ),
        users: {
          [userId()]: name,
        },
        votes: {},
      };

      await firebase
        .firestore()
        .collection('polls')
        .doc(poll.id)
        .set(poll);

      history.push(`/${poll.id}`);
    } catch (e) {
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.title} component="h1" variant="h5">
        simplepoll.org
      </Typography>
      <Typography component="p" className={classes.instructions}>
        Create a poll.
        <br />
        Send the link to people you trust.
      </Typography>
      <form action="" className={classes.form} onSubmit={handleSubmit}>
        <TextField
          label="Your name"
          value={name}
          onChange={e => setName(e.currentTarget.value)}
          variant="outlined"
          color="primary"
          fullWidth
        />
        <TextField
          label="Type your question"
          value={question}
          onChange={e => setQuestion(e.currentTarget.value)}
          variant="outlined"
          color="primary"
          fullWidth
        />
        <Divider />
        <SortableChoices choices={choices} onChange={setChoices} />

        <Button
          className={classes.makePoll}
          variant="contained"
          color="primary"
          disabled={disabled || loading}
          onClick={handleMakePoll}
        >
          {loading ? <CircularProgress size={24} /> : 'Make Poll'}
        </Button>
      </form>
    </div>
  );
}

export default NewPoll;
