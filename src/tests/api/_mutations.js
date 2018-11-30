/* eslint-disable import/prefer-default-export */
import gql from "graphql-tag";
import { StoryData } from "./_fragments";

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
