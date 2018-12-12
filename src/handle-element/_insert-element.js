import { sortItems } from '../_helpers';
import { ERRORS } from '../messages';

export default ({
  data,
  mutationResult,
  insertion,
  field,
  ordering,
  errors,
  ID,
  queryName,
}) => {
  if (
    data &&
    Array.isArray(data) &&
    data.length > 0 &&
    data[0][ID] &&
    mutationResult &&
    mutationResult[ID] &&
    typeof data[0][ID] !== typeof mutationResult[ID]
  ) {
    errors.push(
      `ID type mismatch: ${ID} is type of  [${typeof mutationResult[
        ID
      ]}] while query results ID is type of [${typeof data[0][
        ID
      ]}]. Operation has probably had no effect | ${ERRORS.QUERY.MISMATCH_ID}`
    );
    return data;
  }
  if (insertion) {
    if (insertion === 'SORT') {
      if (data.length === 0) {
        return [mutationResult];
      }
      if (
        typeof data[0] === 'object' &&
        !Array.isArray(data[0] && data[0] !== null)
      ) {
        if (!field) {
          errors.push(
            `[${queryName}] is an array of objects. Sorting it requires a valid field paramater like [${Object.keys(
              data[0]
            ).join(', ')}] but it is missing | ${
              ERRORS.OPERATION.MISSING_SORT_FIELD
            }`
          );
          return data;
        }
        if (!Object.keys(data[0]).includes(field)) {
          errors.push(
            `[${queryName}] is an array of objects. Sorting it requires a valid field paramater like [${Object.keys(
              data[0]
            ).join(', ')}] but it is wrong | ${
              ERRORS.OPERATION.WRONG_SORT_FIELD
            }`
          );
          return data;
        }
        return sortItems({ items: [mutationResult, ...data], ordering, field });
      }
      return sortItems({ items: [mutationResult, ...data], ordering });
    }
    if (insertion === 'BOTTOM') return [...data, mutationResult];
  }
  return [mutationResult, ...data];
};
