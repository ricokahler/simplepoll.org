import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route, Redirect } from 'react-router';
import NewPoll from './NewPoll';
import Poll from './Poll';
import NotFound from './NotFound';

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0 auto',
    width: theme.breakpoints.values.sm,
    maxWidth: '100%',
    border: '3px solid red',
    display: 'flex',
    flexDirection: 'column',
  },
}));

function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Switch>
        <Route path="/404" component={NotFound} />
        <Route path="/:id" component={Poll} />
        <Route path="/" exact component={NewPoll} />
        <Redirect to="/404" />
      </Switch>
    </div>
  );
}

export default App;
