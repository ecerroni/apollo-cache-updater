import handleElement from './handle-element';
import { ERRORS, WARNINGS } from './messages';
import { NO_PARAMS, WITH_PARAMS } from './_enums';

const allowedOperations = {
  type: ['ADD', 'REMOVE', 'MOVE'],
  row: ['TOP', 'BOTTOM', 'SORT'],
  add: undefined,
  remove: undefined,
  searchOperator: ['AND', 'AND_EDGE', 'OR', 'OR_EDGE', 'ANY'],
};

const extractQueryNameAndType = bodyString => {
  const re = /{(.*)}/;
  const m = bodyString.match(re);
  let name;
  let type = NO_PARAMS;
  if (m[1].indexOf('(') > -1) {
    type = WITH_PARAMS;
    name = m[1].substr(0, m[1].indexOf('('));
  } else if (m[1].indexOf('@') > -1) {
    name = m[1].substr(0, m[1].indexOf('@'));
  } else if (m[1].indexOf('{') > -1) {
    name = m[1].substr(0, m[1].indexOf('{'));
  } else {
    name = m[1]; // eslint-disable-line prefer-destructuring
  }
  return [name, type];
};

/**
 * This function updates apollo cache based on the configuration object.
 * @param {Object} configuration object
 * @returns {boolean} if operation did not throw errors.
 */
export default ({
  proxy,
  searchVariables,
  searchOperator = 'AND',
  queriesToUpdate,
  mutationResult,
  operation = 'ADD',
  ID = 'id',
  switchVars,
}) => {
  const errors = [];
  let operator = searchOperator;
  if (!!searchOperator && typeof searchOperator === 'string') {
    if (!allowedOperations.searchOperator.includes(searchOperator)) {
      console.warn(
        `ApolloCacheUpdater Warning: [${allowedOperations.searchOperator.join(
          ' | '
        )}] are the only allowed search operators. Using AND as the default operator | ${
          WARNINGS.SEARCH_OPERATOR.NOT_VALID
        }`
      );
      operator = 'AND';
    }
  } else if (!!searchOperator && typeof searchOperator !== 'string') {
    console.warn(
      `ApolloCacheUpdater Warning: searchOperator should be a string. Using AND as the default operator | ${
        WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING
      }`
    );
    operator = 'AND';
  }

  let operationObj = {
    type: 'ADD',
    row: {
      type: 'TOP',
      field: undefined,
      ordering: undefined,
    },
    add: undefined,
    remove: undefined,
  };
  if (
    typeof operation === 'string' &&
    allowedOperations.type.includes(operation)
  ) {
    operationObj.type = operation;
  } else if (
    typeof operation === 'object' &&
    !Array.isArray(operation) &&
    operation !== null
  ) {
    let rowObj = {};
    if (
      operation.row &&
      typeof operation.row === 'string' &&
      allowedOperations.row.includes(operation.row)
    ) {
      rowObj = {
        row: {
          type: operation.row,
          field: undefined,
          ordering: undefined,
        },
      };
    } else if (
      operation.row &&
      typeof operation.row === 'object' &&
      !Array.isArray(operation.row) &&
      operation.row !== null
    ) {
      rowObj = {
        row: {
          ...rowObj,
          ...operation.row,
        },
      };
    } else if (operation.row && typeof operation.row === 'string')
      errors.push(
        `${operation.row} is not valid. Use one of ${allowedOperations.row.join(
          ', '
        )} | ${ERRORS.OPERATION.INVALID_ROW}`
      );

    if (
      !!operation.add &&
      Object.prototype.toString.call(operation.add) !== '[object Function]'
    ) {
      errors.push(
        `You included a custom "add" field, but it is not a function. Only functions should be used in the "add" field | ${
          ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION
        }`
      );
    }

    if (
      !!operation.remove &&
      Object.prototype.toString.call(operation.remove) !== '[object Function]'
    ) {
      errors.push(
        `You included a custom "remove" field, but it is not a function. Only functions should be used in the "remove" field | ${
          ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION
        }`
      );
    }

    operationObj = {
      ...operationObj,
      ...operation,
      ...rowObj,
    };
  } else if (typeof operation === 'string')
    errors.push(
      `${operation} is not valid. Use one of ${allowedOperations.type.join(
        ', '
      )} | ${ERRORS.OPERATION.NOT_VALID}`
    );
  const customAdd = operationObj.add;
  const customRemove = operationObj.remove;

  if (operationObj.type === 'MOVE' && !switchVars)
    errors.push(
      `ApolloCacheUpdater Warning: MOVE operation requires switchVars but none was found. An empty object was used instead | ${
        ERRORS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE
      }`
    );

  let searchKeys = [];

  if (!searchVariables)
    errors.push(
      `searchVariables are required | ${ERRORS.SEARCH_VARIABLES.MANDATORY}`
    );
  if (
    !!searchVariables &&
    typeof searchVariables === 'object' &&
    !Array.isArray(searchVariables) &&
    searchVariables !== null
  ) {
    const invalid =
      Object.entries(searchVariables).filter(
        entry =>
          typeof entry[1] !== 'string' &&
          typeof entry[1] !== 'number' &&
          typeof entry[1] !== 'boolean'
      ).length > 0;
    if (invalid)
      errors.push(
        `searchVariables cannot have nested objects, or have null values or be a function, Use only number, string and boolean primitives | ${
          ERRORS.SEARCH_VARIABLES.NO_NESTING
        }`
      );
    searchKeys = Object.entries(searchVariables).map(entry =>
      JSON.stringify({ [entry[0]]: entry[1] })
    );
  } else
    errors.push(
      `Invalid object as searchVariables | ${ERRORS.SEARCH_VARIABLES.INVALID}`
    );

  const queries = proxy.data.data.ROOT_QUERY;
  const apolloQueries = queriesToUpdate.map(query => {
    // extract the name of the query
    const bodyString = JSON.stringify(query.loc.source.body)
      .replace(/\\n/g, '')
      .replace(/ /g, '');
    const [queryName, queryType] = extractQueryNameAndType(bodyString);
    return {
      name: queryName,
      type: queryType,
      query,
    };
  });
  // build the entries that match the search variables to be iterated later
  const targetQueries = apolloQueries.map(item => ({
    ...item,
    entries: queries
      ? Object.entries(queries)
          .filter(entry =>
            // entry[0].substring(0, item.name.length + 1) === `${item.name}(`
            {
              if (item.type === WITH_PARAMS) {
                return (
                  entry[0].substring(0, item.name.length + 1) ===
                  `${item.name}(`
                );
              }
              if (item.type === NO_PARAMS) {
                return entry[0].substring(0, item.name.length) === item.name;
              }
              return false;
            }
          )
          .reduce((arr, q) => {
            const k = q[0];
            // eslint-disable-next-line no-nested-ternary
            let match = operator.includes('AND')
              ? searchKeys.filter(searchKey =>
                  k.includes(searchKey.substr(1, searchKey.length - 2))
                ).length === searchKeys.length
              : operator === 'ANY'
              ? true
              : searchKeys.filter(searchKey =>
                  k.includes(searchKey.substr(1, searchKey.length - 2))
                ).length > 0;
            if (operator.includes('EDGE')) {
              // allowEmptyVars
              const re = /{(.*)}/;
              const m = k.match(re);
              if (m) {
                const vars = JSON.parse(m[0]);
                if (Object.entries(vars).filter(v => !!v[1]).length === 0)
                  match = true; // object accepts vars but either an empty varibles object or not variables at all were passed
              }
            }
            if (match) {
              const re = /{(.*)}/;
              const m = k.match(re);
              if (m != null)
                return [...arr, JSON.parse(`{${m[0].replace(re, '$1')}}`)];
              if (m == null && item.type === NO_PARAMS)
                return [...arr, { __vars: null }];
              return [...arr];
            }
            return [...arr];
          }, [])
      : [],
  }));
  if (!mutationResult || mutationResult === null)
    errors.push(
      `mutationResult is required | ${ERRORS.MUTATION_RESULT.MANDATORY}`
    );
  if (
    mutationResult &&
    typeof mutationResult === 'object' &&
    !Array.isArray(mutationResult) &&
    mutationResult !== null
  ) {
    if (!Object.prototype.hasOwnProperty.call(mutationResult, ID))
      errors.push(
        `mutationResult is an object but the field ${ID} is missing | ${
          ERRORS.MUTATION_RESULT.MISSING_ID
        } `
      );
  } else if (Array.isArray(mutationResult))
    errors.push(
      `mutationResult cannot be an array | ${ERRORS.MUTATION_RESULT.NO_ARRAY}`
    );

  const invalid =
    switchVars &&
    Object.entries(switchVars).filter(
      entry =>
        typeof entry[1] !== 'string' &&
        typeof entry[1] !== 'number' &&
        typeof entry[1] !== 'boolean'
    ).length > 0;
  if (invalid)
    errors.push(
      `switchVariables cannot have nested objects, or have null values or be a function, Use only number, string and boolean primitives | ${
        ERRORS.SWITCH_VARIABLES.NO_NESTING
      } `
    );

  if (errors.length === 0 && !!mutationResult) {
    targetQueries.forEach(element => {
      const processedCachedQueries = {
        added: {},
        removed: {},
      };
      element.entries.forEach(variables => {
        const { query } = element;
        if (operationObj.type === 'REMOVE' || operationObj.type === 'ADD') {
          handleElement({
            proxy,
            query,
            mutationResult,
            variables,
            operation: operationObj.type,
            ID,
            element,
            customAdd,
            customRemove,
            insertion: operationObj.row.type,
            field: operationObj.row.field,
            ordering: operationObj.row.ordering,
            errors,
          });
        }
        if (operationObj.type === 'MOVE' && element.type === WITH_PARAMS) {
          let elementToMove = handleElement({
            proxy,
            query,
            mutationResult,
            variables,
            operation: 'REMOVE',
            ID,
            element,
            customRemove,
            errors,
          });
          if (
            !!elementToMove &&
            typeof elementToMove === 'object' &&
            !Array.isArray(elementToMove)
          ) {
            elementToMove = {
              ...elementToMove,
              ...mutationResult,
            };
          }

          // add element only if target queries for the switch are in ROOT_QUERY
          const safeSwitchVars = switchVars;
          searchKeys = Object.entries(safeSwitchVars).map(entry =>
            JSON.stringify({ [entry[0]]: entry[1] })
          );
          const matches = Object.entries(queries)
            .map(q => ({
              name: q[0].substr(0, q[0].indexOf('(')),
              query: q,
            }))
            .filter(
              entry =>
                entry.query[0] === element.name ||
                (entry.query[0].length > element.name.length &&
                  entry.query[0].substr(0, element.name.length) ===
                    element.name &&
                  ['(', '@', '{'].includes(
                    entry.query[0][element.name.length + 1]
                  ))
            )
            .filter(entry => {
              const k = entry.query[0];
              let match = operator.includes('AND')
                ? searchKeys.filter(searchKey =>
                    k.includes(searchKey.substr(1, searchKey.length - 2))
                  ).length === searchKeys.length
                : searchKeys.filter(searchKey =>
                    k.includes(searchKey.substr(1, searchKey.length - 2))
                  ).length > 0;
              if (operator.includes('EDGE')) {
                // allowEmptyVars
                const re = /{(.*)}/;
                const m = k.match(re);
                if (m) {
                  const vars = JSON.parse(m[0]);
                  if (Object.entries(vars).filter(v => !!v[1]).length === 0)
                    match = true; // object accepts vars but either an empty varibles object or not variables at all were passed
                }
              }
              return match;
            });
          const processQuery = matches.length > 0;
          if (processQuery) {
            const re = /{(.*)}/;
            const mm = matches.map(match => ({
              name: match.name,
              match: match.query[0].match(re),
              cachedQuery: match.query[0],
            }));
            const queryVars = mm.map(m => ({
              name: m.name,
              cachedQuery: m.cachedQuery,
              query: apolloQueries.filter(aq => aq.name === m.name)[0].query,
              variables: JSON.parse(m.match[0]),
            }));
            queryVars.forEach(entry => {
              // add once only
              if (
                (!processedCachedQueries.added[entry.name] ||
                  !processedCachedQueries.added[entry.name].includes(
                    entry.cachedQuery
                  )) &&
                element.name === entry.name
              ) {
                handleElement({
                  proxy,
                  query: entry.query,
                  mutationResult: elementToMove,
                  variables: {
                    ...entry.variables,
                  },
                  operation: 'ADD',
                  insertion: operationObj.row.type,
                  field: operationObj.row.field,
                  ordering: operationObj.row.ordering,
                  ID,
                  element,
                  customAdd,
                  errors,
                });
              }
              const existingAddedEntry =
                processedCachedQueries.added[entry.name];
              if (!existingAddedEntry) {
                processedCachedQueries.added[entry.name] = [];
              }
              processedCachedQueries.added[entry.name] = [
                ...processedCachedQueries.added[entry.name],
                entry.cachedQuery,
              ];
            });
          }
        }
      });
    });
  }
  if (errors.length > 0) {
    console.error(
      Array.from(new Set(errors.map(e => `ApolloCacheUpdater Error: ${e}`)))
    );
  }
  return errors.length === 0;
};
