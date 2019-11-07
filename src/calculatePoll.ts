import * as Types from './types';
import userId from './userId';
import { get } from 'lodash';

type Vote = Types.Poll['votes'][string];

function calculateVotes(poll: Types.Poll) {
  const votes = Object.values(poll.votes);

  const groupedByUser: {
    [userId: string]: {
      [optionId: string]: Vote[];
    };
  } = {};

  for (const vote of votes) {
    const votesPerUserPerOption = get(groupedByUser, [vote.userId, vote.optionId]) || [];
    votesPerUserPerOption.push(vote);
    groupedByUser[vote.userId] = groupedByUser[vote.userId] || {};
    groupedByUser[vote.userId][vote.optionId] = votesPerUserPerOption;
  }

  const optionLookup = Object.entries(groupedByUser)
    .map(([userId, optionMap]) => {
      return Object.entries(optionMap).map(([optionId, votes]) => ({
        userId,
        optionId,
        includeVote: votes.length % 2 === 1,
      }));
    })
    .flat()
    .filter(tuple => tuple.includeVote)
    .map(tuple => ({
      userId: tuple.userId,
      user: poll.users[tuple.userId],
      optionId: tuple.optionId,
    }))
    .reduce(
      (acc, tuple) => {
        const users = acc[tuple.optionId] || [];
        users.push({ name: tuple.user, userId: tuple.userId });
        acc[tuple.optionId] = users;
        return acc;
      },
      {} as { [optionId: string]: Array<{ name: string; userId: string }> },
    );

  return optionLookup;
}

function calculatePoll(poll: Types.Poll) {
  const owner = poll.users[poll.ownerId];

  const optionUserLookup = calculateVotes(poll);

  const options = Object.values(poll.options)
    .sort((a, b) => a.position - b.position)
    .map(option => {
      const userTuples = optionUserLookup[option.id] || [];

      return {
        ...option,
        users: userTuples.map(tuple => tuple.name).sort(),
        selfDidVote: !!userTuples.find(tuple => tuple.userId === userId()),
      };
    });

  return {
    options,
    owner,
    question: poll.question,
  };
}

export default calculatePoll;
