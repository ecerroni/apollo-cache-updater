import filterElement from './_filter-element';
import insertElement from './_insert-element';

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
  try {
    // Update data array
    const data = proxy.readQuery({
      query,
      variables,
    });
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
      query,
      variables,
      data,
    });
  } catch (e) {
    console.log(e);
  }
  return targetElement;
};
