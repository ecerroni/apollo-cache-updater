import { getTypeOfElementItems, findDuplicateInArray } from '../_helpers';

export default ({
  element,
  action = 'equal',
  mutationResult,
  ID,
  queryName,
  errors,
}) => {
  const typeOfElementItems = getTypeOfElementItems({
    element,
    ID,
    queryName,
    errors,
    mutationResult,
  });
  const duplicates = [...new Set(findDuplicateInArray(element, ID))];
  // if duplicates we're probably dealing with EDGE cases while operation is MOVE
  if (
    duplicates.length > 0 &&
    typeOfElementItems === 'object' &&
    action === 'not-equal'
  ) {
    const index = duplicates.map(duplicate =>
      element.findIndex(e => e[ID] === duplicate[ID])
    )[0];
    element.splice(index, 1);
    return element;
  }
  return element.filter(e => {
    switch (typeOfElementItems) {
      case 'string' || 'number':
        if (action === 'not-equal') return e !== mutationResult;
        return e === mutationResult;
      case 'object':
        if (action === 'not-equal') return e[ID] !== mutationResult[ID];
        return e[ID] === mutationResult[ID];
      default:
        return true;
    }
  });
};
