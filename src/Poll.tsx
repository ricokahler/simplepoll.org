import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { CircularProgress, Typography, TextField, IconButton } from '@material-ui/core';
import CopyToClipboard from 'react-copy-to-clipboard';
import ShareIcon from '@material-ui/icons/Share';
import { useHistory, RouteComponentProps } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from 'polished';
import { useSnackbar } from 'notistack';
import userId from './userId';
import * as Types from './types';
import firebase from './firebase';
import calculatePoll from './calculatePoll';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  loadingWrapper: {
    minHeight: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
  },
  question: {
    marginBottom: theme.spacing(1),
  },
  questionSubtitle: {
    flex: '1 1 auto',
    marginRight: theme.spacing(2),
  },
  share: {
    flex: '0 0 auto',
  },
  yourName: {
    marginBottom: theme.spacing(4),
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(4),
    },
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    ...theme.typography.body1,
    background: 'none',
    color: 'white',
    backgroundColor: 'black',
    border: '2px solid white',
    borderRadius: 999999,
    display: 'flex',
    padding: theme.spacing(2, 4),
    alignItems: 'center',
    outline: 'none',
    transition: theme.transitions.create('all', { duration: theme.transitions.duration.short }),
    marginBottom: theme.spacing(1),
    '&:focus': {
      color: theme.palette.secondary.main,
      border: `2px solid ${theme.palette.secondary.main}`,
    },
    '&:hover': {
      color: darken(0.1, theme.palette.secondary.main),
      border: `2px solid ${darken(0.1, theme.palette.secondary.main)}`,
    },
    '&:active': {
      color: darken(0.2, theme.palette.secondary.main),
      border: `2px solid ${darken(0.2, theme.palette.secondary.main)}`,
    },
    '&:disabled, &[disabled]': {
      backgroundColor: theme.palette.grey[900],
      color: theme.palette.grey[800],
      border: `2px solid ${theme.palette.grey[900]}`,
    },
  },
  buttonSelected: {
    backgroundColor: 'white',
    color: 'black',
  },
  count: {
    ...theme.typography.h5,
    fontWeight: 900,
    marginRight: theme.spacing(2),
  },
  label: {
    fontSize: 24,
  },
  users: {
    padding: theme.spacing(0, 2),
  },
}));

interface Props extends RouteComponentProps<{ id: string }> {}

function Poll({ match }: Props) {
  const classes = useStyles();
  const { id } = match.params;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [poll, setPoll] = useState<Types.Poll | null>(null);
  const [name, setName] = useState('');

  const getPollRef = useCallback(() => {
    return firebase
      .firestore()
      .collection('polls')
      .doc(id);
  }, [id]);

  const handleOption = async (optionId: string) => {
    const timestamp = Date.now();
    const pollRef = getPollRef();

    try {
      await pollRef.update({
        [`votes.${userId()}_${optionId}_${timestamp}`]: {
          userId: userId(),
          optionId,
          timestamp,
        },
      });
    } catch (e) {
      alert('Something went wrong!');
    }
  };

  useEffect(() => {
    const pollRef = getPollRef();

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
  }, [id, history, getPollRef]);

  useEffect(() => {
    if (!name) return;
    const pollRef = getPollRef();

    async function updateName() {
      await pollRef.update({
        [`users.${userId()}`]: name,
      });
    }

    updateName();
  }, [name, getPollRef]);

  useEffect(() => {
    if (!poll) return;

    const currentName = poll.users[userId()];
    if (!currentName) return;

    setName(currentName);
  }, [poll]);

  useEffect(() => {
    if (!poll) return;
    document.title = poll.question;
  }, [poll]);

  if (!poll) {
    return (
      <div className={classes.loadingWrapper}>
        <CircularProgress />
      </div>
    );
  }

  const { question, owner, options } = calculatePoll(poll);

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <div className={classes.questionSubtitle}>
          <Typography className={classes.question} component="h1" variant="h4">
            {question}
          </Typography>
          <Typography component="p" variant="body2">
            A Simple Poll by {owner}
          </Typography>
        </div>
        <CopyToClipboard
          text={window.location.href}
          onCopy={() => enqueueSnackbar('Link copied to clipboard!')}
        >
          <IconButton>
            <ShareIcon />
          </IconButton>
        </CopyToClipboard>
      </header>

      <TextField
        className={classes.yourName}
        value={name}
        onChange={e => setName(e.currentTarget.value)}
        label="Enter your name"
        variant="outlined"
        fullWidth
      />

      <main className={classes.main}>
        {options.map(({ id, label, users, selfDidVote }) => (
          <div key={id} className={classes.option}>
            <button
              className={classNames(classes.button, {
                [classes.buttonSelected]: selfDidVote,
              })}
              onClick={() => handleOption(id)}
              disabled={!name}
            >
              <Typography className={classes.count} component="span">
                <strong>{users.length}</strong>
              </Typography>
              <Typography className={classes.label} component="span">
                {label}
              </Typography>
            </button>

            <Typography className={classes.users}>{users.join(', ')}</Typography>
          </div>
        ))}
      </main>
    </div>
  );
}

export default Poll;
