import React from "react"; // eslint-disable-line
import { graphql } from "react-apollo";
import { withHandlers, withState, compose } from "recompose";
import ApolloCacheUpdater from "../..";
import StoriesList from "./Stories"; // eslint-disable-line
import {
  stories as storiesQuery,
  storiesCount as storiesCountQuery,
  setStoryStatus as setStoryStatusMutation
} from "../api";

const recomposeStates = compose(withState("mutation", "setMutation", ""));

const recomposeHandlers = withHandlers({
  throwErrors: ({ setStoryStatus, setMutation }) => ({ error }) => { // eslint-disable-line
    setStoryStatus({
      variables: {
        _id: 1,
        published: true,
        flagged: false
      },
      update: (proxy, { data: { setStoryStatus: storyStatus = {} } = {} }) => {
        const mutationResult = storyStatus;
        ApolloCacheUpdater({
          proxy,
          searchVariables: { published: true },
          queriesToUpdate: [storiesQuery, storiesCountQuery],
          mutationResult
        });
        setMutation("completed");
      }
    });
  },
  moveStory: ({ setStoryStatus, setMutation }) => ({ from, to, modifier }) => {
    let variablesFrom = {};
    let searchVariables = {};
    let switchVars = {};
    switch (from) {
      case "publish":
        variablesFrom = {
          published: true,
          flagged: false
        };
        searchVariables = { published: true };
        break;
      default:
        break;
    }
    switch (to) {
      case "archive":
        variablesFrom = {
          published: false,
          flagged: true
        };
        switchVars = { flagged: true };
        break;
      default:
        break;
    }
    setStoryStatus({
      variables: {
        _id: 1,
        ...variablesFrom
      },
      update: (proxy, { data: { setStoryStatus: storyStatus = {} } = {} }) => {
        const mutationResult = storyStatus;
        const updates = ApolloCacheUpdater({
          proxy,
          searchVariables,
          queriesToUpdate: [storiesQuery, storiesCountQuery],
          operation: {
            type: "MOVE",
            row: {
              type: modifier,
              field: "title"
            }
          },
          switchVars,
          mutationResult,
          ID: "_id"
        });
        if (updates) {
          setMutation("completed");
        }
      }
    });
  }
});

const StoriesContainer = ({
  error,
  storiesPublished = [],
  storiesCountPublished,
  storiesUnpublished = [],
  storiesCountUnpublished,
  storiesArchived = [],
  storiesCountArchived,
  throwErrors,
  mutation,
  moveStory
}) => {
  if (error) return null;
  return (
    <div>
      <div>
        <p>ERRORS</p>
        <span onClick={() => throwErrors({ error: "1" })}>Missing Switch</span>
      </div>
      <p data-testid={mutation}>Mutation: {mutation}</p>
      <p>
        Published. Count:
        <span data-testid="published-count">{storiesCountPublished}</span>
      </p>
      <StoriesList
        stories={storiesPublished}
        actions={{
          first: {
            label: "Unpublish",
            move: () => {}
          },
          second: {
            label: "Archive",
            move: moveStory
          }
        }}
      />
      <p>
        Unublished. Count:
        <span data-testid="unpublished-count">{storiesCountUnpublished}</span>
      </p>
      <StoriesList
        stories={storiesUnpublished}
        actions={{
          first: {
            label: "Publish",
            move: () => {}
          },
          second: {
            label: "Archive",
            move: moveStory
          }
        }}
      />
      <p>
        Archived. Count:
        <span data-testid="archived-count">{storiesCountArchived}</span>
      </p>
      <StoriesList
        stories={storiesArchived}
        actions={{
          first: {
            label: "Republish",
            move: moveStory
          },
          second: {
            label: "Delete",
            move: () => {}
          }
        }}
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

const withStoriesUnpublishedQuery = graphql(storiesQuery, {
  options: () => ({
    variables: {
      where: {
        published: false,
        flagged: false
      }
    }
  }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesUnpublished: stories
      };
    }
    return { error, storiesUnpublished: [] };
  }
});

const withStoriesCountArchivedQuery = graphql(storiesCountQuery, {
  options: () => ({
    variables: {
      where: {
        flagged: true
      }
    }
  }),
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountArchived: storiesCount
      };
    }
    return { error, storiesCountArchived: [] };
  }
});

const withStoriesArchivedQuery = graphql(storiesQuery, {
  options: () => ({
    variables: {
      where: {
        flagged: true
      }
    }
  }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesArchived: stories
      };
    }
    return { error, storiesArchived: [] };
  }
});

const withStoriesCountUnpublishedQuery = graphql(storiesCountQuery, {
  options: () => ({
    variables: {
      where: {
        published: false,
        flagged: false
      }
    }
  }),
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountUnpublished: storiesCount
      };
    }
    return { error, storiesCountUnpublished: [] };
  }
});

const withSetStoryStatus = graphql(setStoryStatusMutation, {
  name: "setStoryStatus"
});

export default compose(
  withStoriesPublishedQuery,
  withStoriesCountPublishedQuery,
  withStoriesCountUnpublishedQuery,
  withStoriesUnpublishedQuery,
  withStoriesArchivedQuery,
  withStoriesCountArchivedQuery,
  withSetStoryStatus,
  recomposeStates,
  recomposeHandlers
)(StoriesContainer);
