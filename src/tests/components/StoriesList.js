import React from "react"; // eslint-disable-line
import { graphql } from "react-apollo";
import { withHandlers, withState, compose } from "recompose";
import ApolloCacheUpdater from "../..";
import StoriesList from "./Stories"; // eslint-disable-line
import {
  stories as storiesQuery,
  storiesNoId as storiesQueryNoId,
  storiesCount as storiesCountQuery,
  setStoryStatus as setStoryStatusMutation
} from "../api";
import { ERRORS, WARNINGS } from "../../messages";

const ERRORS_SET = [
  ERRORS.MUTATION_RESULT.MISSING_ID,
  ERRORS.MUTATION_RESULT.NO_ARRAY,
  ERRORS.SWITCH_VARIABLES.NO_NESTING,
  ERRORS.QUERY.MISSING_ID,
  ERRORS.OPERATION.INVALID_ROW,
  ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION,
  ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION,
  ERRORS.OPERATION.NOT_VALID,
  ERRORS.SEARCH_VARIABLES.MANDATORY,
  ERRORS.SEARCH_VARIABLES.NO_NESTING,
  ERRORS.SEARCH_VARIABLES.INVALID,
  ERRORS.MUTATION_RESULT.MANDATORY,
  WARNINGS.SEARCH_OPERATOR.NOT_VALID,
  WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING,
  WARNINGS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE
];

const recomposeStates = compose(withState("mutation", "setMutation", ""));
let queriesToUpdate = [storiesQuery, storiesCountQuery];
const recomposeHandlers = withHandlers({
  throwErrors: ({ setStoryStatus, setMutation }) => ({ error }) => { // eslint-disable-line
    if (error && error === ERRORS.QUERY.MISSING_ID) {
      queriesToUpdate = [storiesQueryNoId, storiesCountQuery];
    }
    setStoryStatus({
      variables: {
        _id: 1,
        published: true,
        flagged: false
      },
      update: (proxy, { data: { setStoryStatus: storyStatus = {} } = {} }) => {
        const mutationResult = storyStatus;
        const defaultUpdaterObject = {
          proxy, // mandatory
          operation: "MOVE",
          queriesToUpdate,
          searchVariables: {
            published: true // find the mutation result article that in the cache is still part of the queries with published = true and remove it
          },
          switchVars: {
            published: false // add the mutation result article to the queries that in the cache were invoked with published = false, if any
          },
          mutationResult,
          ID: "_id"
        };
        switch (error) {
          case ERRORS.MUTATION_RESULT.MISSING_ID:
            delete defaultUpdaterObject.ID;
            break;
          case ERRORS.MUTATION_RESULT.NO_ARRAY:
            defaultUpdaterObject.mutationResult = [{ _id: 1 }];
            break;
          case ERRORS.SWITCH_VARIABLES.NO_NESTING:
            defaultUpdaterObject.switchVars = { where: { published: true } };
            break;
          case ERRORS.SEARCH_VARIABLES.NO_NESTING:
            defaultUpdaterObject.searchVariables = {
              where: { published: true }
            };
            break;
          case ERRORS.OPERATION.INVALID_ROW:
            defaultUpdaterObject.operation = {
              type: "MOVE",
              row: "KK"
            };
            break;
          case ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION:
            defaultUpdaterObject.operation = {
              type: "MOVE",
              add: "no_func"
            };
            break;
          case ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION:
            defaultUpdaterObject.operation = {
              type: "MOVE",
              remove: "no_func"
            };
            break;
          case ERRORS.OPERATION.NOT_VALID:
            defaultUpdaterObject.operation = "KK";
            break;
          case ERRORS.SEARCH_VARIABLES.MANDATORY:
            delete defaultUpdaterObject.searchVariables;
            break;
          case ERRORS.SEARCH_VARIABLES.INVALID:
            defaultUpdaterObject.searchVariables = [{ published: true }];
            break;
          case ERRORS.MUTATION_RESULT.MANDATORY:
            delete defaultUpdaterObject.mutationResult;
            break;
          case WARNINGS.SEARCH_OPERATOR.NOT_VALID:
            defaultUpdaterObject.searchOperator = "ORR";
            break;
          case WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING:
            defaultUpdaterObject.searchOperator = ["AND"];
            break;
          case WARNINGS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE:
            delete defaultUpdaterObject.switchVars;
            break;
          default:
            break;
        }

        ApolloCacheUpdater({
          ...defaultUpdaterObject
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
        {ERRORS_SET.map(e => (
          <span key={e} onClick={() => throwErrors({ error: e })}>
            {e}
          </span>
        ))}
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
