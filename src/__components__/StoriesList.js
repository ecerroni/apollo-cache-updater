import React from 'react'; // eslint-disable-line
import { graphql } from 'react-apollo';
import { withHandlers, withState, compose, branch } from 'recompose';
import ApolloCacheUpdater from '..';
import StoriesList from './Stories'; // eslint-disable-line
import {
  stories as storiesQuery,
  storiesNoId as storiesQueryNoId,
  storiesCount as storiesCountQuery,
  setStoryStatus as setStoryStatusMutation,
  addStory as addStoryMutation,
  storiesNoParams as storiesNoParamsQuery,
  storiesCountNoParams as storiesCountNoParamsQuery,
  removeStory as removeStoryMutation,
} from '../__api__';
import { ERRORS, WARNINGS } from '../messages';
import fixtures from '../__fixtures__';

const { addedStory } = fixtures;

const ERRORS_SET = [
  ERRORS.MUTATION_RESULT.MISSING_ID,
  ERRORS.MUTATION_RESULT.NO_ARRAY,
  ERRORS.MUTATION_RESULT.MANDATORY,
  ERRORS.QUERY.MISSING_ID,
  ERRORS.QUERY.MISMATCH_ID,
  ERRORS.OPERATION.INVALID_ROW,
  ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION,
  ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION,
  ERRORS.OPERATION.MISSING_SORT_FIELD,
  ERRORS.OPERATION.WRONG_SORT_FIELD,
  ERRORS.OPERATION.NOT_VALID,
  ERRORS.SEARCH_VARIABLES.MANDATORY,
  ERRORS.SEARCH_VARIABLES.NO_NESTING,
  ERRORS.SEARCH_VARIABLES.INVALID,
  WARNINGS.SEARCH_OPERATOR.NOT_VALID,
  WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING,
  ERRORS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE,
  ERRORS.SWITCH_VARIABLES.NO_NESTING,
];

const recomposeStates = compose(withState('mutation', 'setMutation', ''));

let queriesToUpdate = [storiesQuery, storiesCountQuery];

const recomposeHandlers = withHandlers({
  add: ({ addStory, setMutation, noParams, noParamsEdge }) => () => {
    if (noParams) {
      queriesToUpdate = [
        storiesQuery,
        storiesCountQuery,
        storiesNoParamsQuery,
        storiesCountNoParamsQuery,
      ];
    }
    addStory({
      variables: {
        ...addedStory,
      },
      update: (proxy, { data: { addStory: Story = {} } = {} }) => {
        const mutationResult = Story;
        const defaultUpdaterObject = {
          proxy, // mandatory
          queriesToUpdate,
          searchOperator: noParamsEdge ? 'AND_EDGE' : 'AND',
          searchVariables: {
            published: true, // find the mutation result article that in the cache is still part of the queries with published = true and remove it
          },
          mutationResult,
          ID: '_id',
        };
        ApolloCacheUpdater({
          ...defaultUpdaterObject,
        });
        setMutation('completed');
      },
    });
  },
  remove: ({ removeStory, setMutation, noParams, noParamsEdge }) => () => {
    if (noParams) {
      queriesToUpdate = [
        storiesQuery,
        storiesCountQuery,
        storiesNoParamsQuery,
        storiesCountNoParamsQuery,
      ];
    }
    removeStory({
      variables: {
        _id: 1,
      },
      update: proxy => {
        const mutationResult = { _id: '1' };
        const defaultUpdaterObject = {
          proxy, // mandatory
          queriesToUpdate,
          operation: 'REMOVE',
          searchOperator: noParamsEdge ? 'AND_EDGE' : 'AND',
          searchVariables: {
            published: true, // find the mutation result article that in the cache is still part of the queries with published = true and remove it
          },
          mutationResult,
          ID: '_id',
        };
        ApolloCacheUpdater({
          ...defaultUpdaterObject,
        });
        setMutation('completed');
      },
    });
  },
  moveStory: ({ setStoryStatus, setMutation, noParams, noParamsEdge }) => ({
    from,
    to,
    modifier,
  }) => {
    if (noParams) {
      queriesToUpdate = [
        storiesQuery,
        storiesCountQuery,
        storiesNoParamsQuery,
        storiesCountNoParamsQuery,
      ];
    }
    let variablesFrom = {};
    let searchVariables = {};
    let switchVars = {};
    switch (from) {
      case 'publish':
        variablesFrom = {
          published: true,
          flagged: false,
        };
        searchVariables = { published: true };
        break;
      default:
        break;
    }
    switch (to) {
      case 'archive':
        variablesFrom = {
          published: false,
          flagged: true,
        };
        switchVars = { flagged: true };
        break;
      case 'unpublish':
        variablesFrom = {
          published: false,
          flagged: false,
        };
        switchVars = { published: false };
        break;
      default:
        break;
    }
    setStoryStatus({
      variables: {
        _id: 1,
        ...variablesFrom,
      },
      update: (proxy, { data: { setStoryStatus: storyStatus = {} } = {} }) => {
        const mutationResult = storyStatus;
        const updates = ApolloCacheUpdater({
          proxy,
          searchVariables,
          queriesToUpdate: [storiesQuery, storiesCountQuery],
          searchOperator: noParamsEdge ? 'AND_EDGE' : 'AND',
          operation: {
            type: 'MOVE',
            row: {
              type: modifier,
              field: 'title',
            },
          },
          switchVars,
          mutationResult,
          ID: '_id',
        });
        if (updates) {
          setMutation('completed');
        }
      },
    });
  },
  throwErrors: ({ setStoryStatus, setMutation }) => ({ error }) => { // eslint-disable-line
    if (error && error === ERRORS.QUERY.MISSING_ID) {
      queriesToUpdate = [storiesQueryNoId, storiesCountQuery];
    }
    setStoryStatus({
      variables: {
        _id: 1,
        published: true,
        flagged: false,
      },
      update: (proxy, { data: { setStoryStatus: storyStatus = {} } = {} }) => {
        const mutationResult = storyStatus;
        const defaultUpdaterObject = {
          proxy, // mandatory
          operation: 'MOVE',
          queriesToUpdate,
          searchVariables: {
            published: true, // find the mutation result article that in the cache is still part of the queries with published = true and remove it
          },
          switchVars: {
            published: false, // add the mutation result article to the queries that in the cache were invoked with published = false, if any
          },
          mutationResult,
          ID: '_id',
        };
        switch (error) {
          case ERRORS.MUTATION_RESULT.MISSING_ID:
            delete defaultUpdaterObject.ID;
            break;
          case ERRORS.QUERY.MISMATCH_ID:
            defaultUpdaterObject.operation = 'ADD';
            defaultUpdaterObject.mutationResult = {
              _id: parseInt(defaultUpdaterObject.mutationResult._id, 10) // eslint-disable-line
            };
            break;
          case ERRORS.MUTATION_RESULT.NO_ARRAY:
            defaultUpdaterObject.mutationResult = [{ _id: 1 }];
            break;
          case ERRORS.SWITCH_VARIABLES.NO_NESTING:
            defaultUpdaterObject.switchVars = { where: { published: true } };
            break;
          case ERRORS.SEARCH_VARIABLES.NO_NESTING:
            defaultUpdaterObject.searchVariables = {
              where: { published: true },
            };
            break;
          case ERRORS.SEARCH_VARIABLES.MANDATORY:
            delete defaultUpdaterObject.searchVariables;
            break;
          case ERRORS.OPERATION.INVALID_ROW:
            defaultUpdaterObject.operation = {
              type: 'MOVE',
              row: 'KK',
            };
            break;
          case ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION:
            defaultUpdaterObject.operation = {
              type: 'MOVE',
              add: 'no_func',
            };
            break;
          case ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION:
            defaultUpdaterObject.operation = {
              type: 'MOVE',
              remove: 'no_func',
            };
            break;
          case ERRORS.OPERATION.NOT_VALID:
            defaultUpdaterObject.operation = 'KK';
            break;
          case ERRORS.OPERATION.MISSING_SORT_FIELD:
            defaultUpdaterObject.operation = {
              ...defaultUpdaterObject.operation,
              row: {
                type: 'SORT',
              },
            };
            break;
          case ERRORS.OPERATION.WRONG_SORT_FIELD:
            defaultUpdaterObject.operation = {
              ...defaultUpdaterObject.operation,
              row: {
                type: 'SORT',
                field: 'a',
              },
            };
            break;
          case ERRORS.SEARCH_VARIABLES.INVALID:
            defaultUpdaterObject.searchVariables = [{ published: true }];
            break;
          case ERRORS.MUTATION_RESULT.MANDATORY:
            delete defaultUpdaterObject.mutationResult;
            break;
          case WARNINGS.SEARCH_OPERATOR.NOT_VALID:
            defaultUpdaterObject.searchOperator = 'ORR';
            break;
          case WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING:
            defaultUpdaterObject.searchOperator = ['AND'];
            break;
          case ERRORS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE:
            delete defaultUpdaterObject.switchVars;
            break;
          default:
            break;
        }

        ApolloCacheUpdater({
          ...defaultUpdaterObject,
        });
        setMutation('completed');
      },
    });
  },
});

const StoriesContainer = ({
  error,
  storiesPublished = [],
  storiesCountPublished,
  storiesUnpublished = [],
  storiesCountUnpublished,
  storiesArchived = [],
  storiesCountArchived,
  storiesNoParams,
  storiesCountNoParams,
  throwErrors,
  mutation,
  moveStory,
  add,
  remove,
}) => {
  if (error) return null;
  return (
    <div>
      <div>
        <div>
          <p onClick={() => add()}>Add_Published_TOP</p>
        </div>
        <div>
          <p onClick={() => remove()}>Remove_Published</p>
        </div>
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
        key={1}
        stories={storiesPublished}
        actions={{
          first: {
            label: 'Unpublish',
            move: moveStory,
          },
          second: {
            label: 'Archive',
            move: moveStory,
          },
        }}
      />
      <p>
        Unublished. Count:
        <span data-testid="unpublished-count">{storiesCountUnpublished}</span>
      </p>
      <StoriesList
        key={2}
        stories={storiesUnpublished}
        actions={{
          first: {
            label: 'Publish',
            move: () => {},
          },
          second: {
            label: 'Archive',
            move: moveStory,
          },
        }}
      />
      <p>
        Archived. Count:
        <span data-testid="archived-count">{storiesCountArchived}</span>
      </p>
      <StoriesList
        key={3}
        stories={storiesArchived}
        actions={{
          first: {
            label: 'Republish',
            move: moveStory,
          },
          second: {
            label: 'Delete',
            move: () => {},
          },
        }}
      />
      <p>
        ALL STORIES
        <span data-testid="no-params-count">{storiesCountNoParams}</span>
      </p>
      <StoriesList
        key={4}
        stories={storiesNoParams}
        actions={{
          first: {
            label: 'Default',
            move: () => {},
          },
          second: {
            label: '',
            move: () => {},
          },
        }}
      />
    </div>
  );
};

const withStoriesPublishedQuery = graphql(storiesQuery, {
  options: () => ({
    variables: {
      where: {
        published: true,
      },
    },
  }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesPublished: stories,
      };
    }
    return { error, storiesPublished: [] };
  },
});

const withStoriesCountPublishedQuery = graphql(storiesCountQuery, {
  options: () => ({
    variables: {
      where: {
        published: true,
      },
    },
  }),
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountPublished: storiesCount,
      };
    }
    return { error, storiesCountPublished: [] };
  },
});

const withStoriesUnpublishedQuery = graphql(storiesQuery, {
  options: () => ({
    variables: {
      where: {
        published: false,
        flagged: false,
      },
    },
  }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesUnpublished: stories,
      };
    }
    return { error, storiesUnpublished: [] };
  },
});

const withStoriesCountArchivedQuery = graphql(storiesCountQuery, {
  options: () => ({
    variables: {
      where: {
        flagged: true,
      },
    },
  }),
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountArchived: storiesCount,
      };
    }
    return { error, storiesCountArchived: [] };
  },
});

const withStoriesArchivedQuery = graphql(storiesQuery, {
  options: () => ({
    variables: {
      where: {
        flagged: true,
      },
    },
  }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesArchived: stories,
      };
    }
    return { error, storiesArchived: [] };
  },
});

const withStoriesCountUnpublishedQuery = graphql(storiesCountQuery, {
  options: () => ({
    variables: {
      where: {
        published: false,
        flagged: false,
      },
    },
  }),
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountUnpublished: storiesCount,
      };
    }
    return { error, storiesCountUnpublished: [] };
  },
});

const withStoriesNoParamsQuery = graphql(storiesNoParamsQuery, {
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesNoParams: stories,
      };
    }
    return { error, storiesNoParmas: [] };
  },
});

const withStoriesNoParamsEdgeQuery = graphql(storiesQuery, {
  // the following should work as well
  // options: () => ({
  //   variables: {}
  // }),
  props: ({ data: { stories = {}, error } }) => {
    if (stories) {
      return {
        error,
        storiesNoParams: stories,
      };
    }
    return { error, storiesNoParmas: [] };
  },
});

const withConditionalStoriesQuery = branch(
  ({ noParamsEdge }) => !!noParamsEdge,
  withStoriesNoParamsEdgeQuery,
  withStoriesNoParamsQuery
);

const withStoriesCountNoParamsQuery = graphql(storiesCountNoParamsQuery, {
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountNoParams: storiesCount,
      };
    }
    return { error, storiesCountNoParams: [] };
  },
});

const withStoriesCountNoParamsEdgeQuery = graphql(storiesCountQuery, {
  props: ({ data: { error, storiesCount } }) => {
    if (storiesCount) {
      return {
        error,
        storiesCountNoParams: storiesCount,
      };
    }
    return { error, storiesCountNoParams: [] };
  },
});

const withConditionalStoriesCountQuery = branch(
  ({ noParamsEdge }) => !!noParamsEdge,
  withStoriesCountNoParamsEdgeQuery,
  withStoriesCountNoParamsQuery
);

const withSetStoryStatus = graphql(setStoryStatusMutation, {
  name: 'setStoryStatus',
});

const withAddStory = graphql(addStoryMutation, {
  name: 'addStory',
});

const withRemoveStory = graphql(removeStoryMutation, {
  name: 'removeStory',
});

export default compose(
  withConditionalStoriesQuery,
  withConditionalStoriesCountQuery,
  withStoriesPublishedQuery,
  withStoriesCountPublishedQuery,
  withStoriesCountUnpublishedQuery,
  withStoriesUnpublishedQuery,
  withStoriesArchivedQuery,
  withStoriesCountArchivedQuery,
  withSetStoryStatus,
  withAddStory,
  withRemoveStory,
  recomposeStates,
  recomposeHandlers
)(StoriesContainer);
