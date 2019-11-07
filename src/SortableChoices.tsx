import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { SortableContainer, SortableElement, SortableHandle, SortEnd } from 'react-sortable-hoc';
import { TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import ReorderIcon from '@material-ui/icons/Reorder';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    paddingInlineStart: 0,
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
  choice: {
    display: 'flex',
    alignItems: 'center',
  },
  textField: {
    flex: '1 1 auto',
    marginRight: theme.spacing(2),
  },
  dragHandle: {
    flex: '0 0 auto',
  },
  disableSelect: {
    '& *': {
      userSelect: 'none',
    },
  },
}));

interface Props {
  className?: string;
  choices: string[];
  onChange: (choices: string[]) => void;
}

const DragHandle = SortableHandle(ReorderIcon);

const SortableChoice = SortableElement((props: TextFieldProps) => {
  const classes = useStyles();

  return (
    <div className={classes.choice}>
      <TextField className={classNames('choice', classes.textField)} {...props} />
      <DragHandle className={classes.dragHandle} />
    </div>
  );
});

const SortableList = SortableContainer(({ className, choices: _choices, onChange }: Props) => {
  const classes = useStyles();
  const lastChoice = _choices[_choices.length - 1];
  const showNewTextField = _choices.length <= 0 || !!lastChoice;

  const choices = [..._choices];

  if (showNewTextField) {
    choices.push('');
  }

  return (
    <ul className={classNames(className, classes.root)}>
      {choices.map((choice, index) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange([
            ...choices.slice(0, index),
            e.currentTarget.value,
            ...choices.slice(index + 1, choices.length),
          ]);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const empty = !e.currentTarget.value;
          const last = index >= choices.length - 1;

          if (empty && !last) {
            onChange([...choices.slice(0, index), ...choices.slice(index + 1, choices.length)]);
          }
        };

        return (
          <SortableChoice
            index={index}
            label={`Choice ${index + 1}`}
            variant="outlined"
            fullWidth
            key={index}
            value={choice}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );
      })}
    </ul>
  );
});

function SortableChoices(props: Props) {
  const classes = useStyles();
  const { choices, onChange } = props;

  const handleSortStart = () => {
    document.body.classList.add(classes.disableSelect);
  };

  const handleSortEnd = ({ newIndex, oldIndex }: SortEnd) => {
    const choice = choices[oldIndex];

    const withoutOldIndex = [
      ...choices.slice(0, oldIndex),
      ...choices.slice(oldIndex + 1, choices.length),
    ];

    const withNextIndex = [
      ...withoutOldIndex.slice(0, newIndex),
      choice,
      ...withoutOldIndex.slice(newIndex, withoutOldIndex.length),
    ];

    onChange(withNextIndex);

    document.body.classList.remove(classes.disableSelect);
  };

  return (
    <SortableList
      {...props}
      onSortStart={handleSortStart}
      onSortEnd={handleSortEnd}
      useDragHandle
      lockAxis="y"
    />
  );
}

export default SortableChoices;
