import React from "react"; // eslint-disable-line
import { graphql, compose } from "react-apollo";
import StoriesList from "./Stories"; // eslint-disable-line
import {
  stories as storiesQuery,
  storiesCount as storiesCountQuery
} from "../api";

const StoriesContainer = ({
  error,
  storiesPublished = [],
  storiesCountPublished
}) => {
  if (error) return null;
  return (
    <div>
      <p>
        Published. Count:{" "}
        <span data-test="published-count">{storiesCountPublished}</span>
      </p>
      <StoriesList
        stories={storiesPublished}
        actions={{ first: "Unpublish", second: "Archive" }}
      />
    </div>
  );
};

const withStoriesPublishedQuery = graphql(storiesQuery, {
  options: () => ({
    variables: {
      where: {
        published: true
      }
    }
  }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesPublished: stories
      };
    }
    return { error, storiesPublished: [] };
  }
});

const withStoriesCountPublishedQuery = graphql(storiesCountQuery, {
  options: () => ({
    variables: {
      where: {
        published: true
      }
    }
  }),
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountPublished: storiesCount
      };
    }
    return { error, storiesCountPublished: [] };
  }
});

export default compose(
  withStoriesPublishedQuery,
  withStoriesCountPublishedQuery
)(StoriesContainer);
