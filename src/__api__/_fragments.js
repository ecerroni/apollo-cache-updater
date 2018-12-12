/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag';

export const StoryData = {
  fragments: {
    storyStatus: gql`
      fragment StoryStatus on Story {
        _id
        published
        flagged
      }
    `,
  },
};
