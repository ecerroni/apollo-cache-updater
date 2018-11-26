import { sortItems } from  '../_helpers';

export default ({ data, mutationResult, insertion, field, ordering, errors, queryName }) => {
  if (insertion) {
    if (insertion === 'SORT') {
      if (data.length === 0) {
        return [mutationResult];
      }
      if (typeof data[0] === 'object' && !Array.isArray(data[0] && data[0] !== null)) {
        if (!field) {
          errors.push(`[${queryName}] is an array of objects. Sorting it requires a field paramater like [${Object.keys(data[0]).join(', ')}]`);
          return data;
        }
        return sortItems({ items: [mutationResult, ...data], ordering, field });  
      }
      return sortItems({ items: [mutationResult, ...data], ordering })
    }
    if (insertion === 'BOTTOM') return [...data, mutationResult];
  }
  return [mutationResult, ...data];
};