import setupClient from 'apollo-client-mock';
import typeDefs from './_schema';
import fixtures from '../__fixtures__';

const filterStories = args => {
  const { stories } = fixtures;
  const { where: operators = null } = args;
  let result = stories;
  if (operators) {
    const { published, flagged } = operators;
    result = stories.filter(s => {
      if (published && s.published) {
        return true;
      }
      if (!published && !flagged && !s.published && !s.flagged) {
        return true;
      }
      if (!published && flagged && !s.published && s.flagged) {
        return true;
      }
      return false;
    });
  }
  return result;
};
const defaultMocks = {
  Query: () => ({
    storiesCount: (_, args) => filterStories(args).length,
    stories: (_, args) => filterStories(args),
  }),
  /* eslint-disable no-underscore-dangle */
  Mutation: () => ({
    setStoryStatus: (_, { _id, published, flagged }) => {
      const { stories } = fixtures;
      const story =
        stories.filter(s => s._id === _id).length > 0
          ? stories.filter(s => s._id === _id)[0]
          : null;
      if (!story) {
        return null;
      }
      return {
        ...story,
        published,
        flagged,
      };
    },
    addStory: (_, { _id, title, published, flagged }) => ({
      _id,
      title,
      published,
      flagged,
    }),
    removeStory: (_, { _id }) => `${_id} removed!`,
  }),
};

const createClient = setupClient(defaultMocks, typeDefs);

export default createClient;
