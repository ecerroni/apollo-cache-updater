/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag';
import { StoryData } from './_fragments';

export const setStoryStatus = gql`
  mutation setStoryStatus(
    $_id: Int!
    $published: Boolean!
    $flagged: Boolean!
  ) {
    setStoryStatus(_id: $_id, published: $published, flagged: $flagged) {
      ...StoryStatus
    }
  }
  ${StoryData.fragments.storyStatus}
`;

export const addStory = gql`
  mutation setStoryStatus(
    $_id: Int!
    $title: String!
    $published: Boolean!
    $flagged: Boolean!
  ) {
    addStory(
      _id: $_id
      published: $published
      title: $title
      flagged: $flagged
    ) {
      ...StoryStatus
      title
    }
  }
  ${StoryData.fragments.storyStatus}
`;

export const removeStory = gql`
  mutation removeStory($_id: Int!) {
    removeStory(_id: $_id)
  }
`;
