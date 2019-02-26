import filterElement from './_filter-element';
import insertElement from './_insert-element';
import { deepCopy } from '../_helpers';
import { NO_PARAMS } from '../_enums';

export default ({
  proxy,
  query,
  variables,
  mutationResult,
  operation,
  ID,
  element,
  customAdd,
  customRemove,
  errors,
  insertion,
  field,
  ordering,
}) => {
  let targetElement;
  const proxyObject = { query, variables };

  if (
    variables &&
    typeof variables === 'object' &&
    Object.prototype.hasOwnProperty.call(variables, '__vars') &&
    element.type === NO_PARAMS
  )
    delete proxyObject.variables;
  try {
    // Update data array
    let data = proxy.readQuery({
      ...proxyObject,
    });
    if (
      // unfreeze whole data if data[element.name] array is frozen
      Array.isArray(data[element.name]) &&
      Object.isFrozen(data[element.name])
    ) {
      data = deepCopy(data);
    }
    if (operation === 'REMOVE') {
      if (Array.isArray(data[element.name])) {
        // eslint-disable-next-line prefer-destructuring
        targetElement = filterElement({
          element: data[element.name],
          mutationResult,
          ID,
          queryName: element.name,
          errors,
        })[0];
        let customData;
        if (customRemove) {
          customData = customRemove({
            query: element.name,
            type: 'array',
            data: data[element.name],
            variables,
          });
        }

        data[element.name] =
          customData && typeof customData === typeof data[element.name]
            ? customData
            : [
                ...filterElement({
                  element: data[element.name],
                  action: 'not-equal',
                  mutationResult,
                  ID,
                  queryName: element.name,
                  errors,
                }),
              ];
      } else if (typeof data[element.name] === 'number') {
        targetElement = data[element.name];
        let customData;
        if (customRemove) {
          customData = customRemove({
            query: element.name,
            type: 'number',
            data: data[element.name],
            variables,
          });
        }
        data[element.name] =
          customData && typeof customData === typeof data[element.name]
            ? customData
            : data[element.name] - 1;
      } else if (typeof data[element.name] === 'string') {
        targetElement = data[element.name];
        let customData;
        if (customRemove) {
          customData = customRemove({
            query: element.name,
            type: 'string',
            data: data[element.name],
            variables,
          });
        }
        data[element.name] =
          customData && typeof customData === typeof data[element.name]
            ? customData
            : data[element.name];
      } else if (typeof data[element.name] === 'object') {
        targetElement = data[element.name];
        let customData;
        if (customRemove) {
          customData = customRemove({
            query: element.name,
            type: 'object',
            data: data[element.name],
            variables,
          });
        }
        data[element.name] =
          customData &&
          typeof customData === typeof data[element.name] &&
          !Array.isArray(customData) &&
          operation !== customData
            ? customData
            : data[element.name];
      }
    } else if (operation === 'ADD') {
      if (Array.isArray(data[element.name])) {
        targetElement = mutationResult;
        let customData;
        if (customAdd) {
          customData = customAdd({
            query: element.name,
            type: 'array',
            data: data[element.name],
            variables,
          });
        }
        data[element.name] =
          customData && typeof customData === typeof data[element.name]
            ? customData
            : insertElement({
                mutationResult,
                data: data[element.name],
                insertion,
                field,
                ordering,
                errors,
                ID,
                queryName: element.name,
              });
      } else if (typeof data[element.name] === 'number') {
        targetElement = data[element.name];
        let customData;
        if (customAdd) {
          customData = customAdd({
            query: element.name,
            type: 'number',
            data: data[element.name],
            variables,
          });
        }

        data[element.name] =
          customData && typeof customData === typeof data[element.name]
            ? customData
            : data[element.name] + 1;
      } else if (typeof data[element.name] === 'string') {
        targetElement = data[element.name];
        let customData;
        if (customAdd) {
          customData = customAdd({
            query: element.name,
            type: 'string',
            data: data[element.name],
            variables,
          });
        }

        data[element.name] =
          customData && typeof customData === typeof data[element.name]
            ? customData
            : data[element.name];
      } else if (typeof data[element.name] === 'object') {
        targetElement = data[element.name];
        let customData;
        if (customAdd) {
          customData = customAdd({
            query: element.name,
            type: 'object',
            data: data[element.name],
            variables,
          });
        }
        data[element.name] =
          customData &&
          typeof customData === typeof data[element.name] &&
          !Array.isArray(customData) &&
          operation !== customData
            ? customData
            : data[element.name];
      }
    }
    proxy.writeQuery({
      ...proxyObject,
      data,
    });
  } catch (e) {
    console.log(e);
  }
  return targetElement;
};
