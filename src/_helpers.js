import { ERRORS } from "./messages";

export const getTypeOfElementItems = ({ element, ID, queryName, errors }) => {
  if (element.length < 1) return undefined;
  const item = element[0];
  switch (typeof item) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "object":
      if (item === null) return undefined;
      if (Array.isArray(item)) return "array";
      if (!Object.prototype.hasOwnProperty.call(item, ID)) {
        errors.push(
          `${ID} was not found in the [${queryName}] query results, please add it in your gql query. Apollo cache is now probably inconsistent | ${
            ERRORS.QUERY.MISSING_ID
          }`
        );
        return undefined;
      }
      return "object";
    default:
      return undefined;
  }
};

export const sortItems = ({ items = [], ordering = "ASC", field = null }) =>
  items.sort((a, b) => {
    if (!field) {
      if (typeof a === "number") {
        if (ordering === "ASC") {
          return a - b;
        }
        return b - a;
      }
      if (typeof a === "string") {
        if (a < b) {
          const value = ordering === "ASC" ? -1 : 1;
          return value;
        }
        if (a > b) {
          const value = ordering === "ASC" ? 1 : -1;
          return value;
        }
        // names must be equal
        return 0;
      }
      // TODO: sort also date objects
      // use Object.prototype.toString.call(field) === '[object Date]'
      // return field.getTime() - field.getTime()
    } else if (typeof a === "object") {
      if (typeof a[field] === "number") {
        if (ordering === "ASC") {
          return a[field] - b[field];
        }
        return b[field] - a[field];
      }
      if (typeof a[field] === "string") {
        const nameA = a[field].toUpperCase();
        const nameB = b[field].toUpperCase();
        if (nameA < nameB) {
          const value = ordering === "ASC" ? -1 : 1;
          return value;
        }
        if (nameA > nameB) {
          const value = ordering === "ASC" ? 1 : -1;
          return value;
        }
        // names must be equal
        return 0;
      }
      // TODO: sort also date objects
      // use Object.prototype.toString.call(field) === '[object Date]'
      // return field.getTime() - field.getTime()
    }
    return 0; // do nothing;
  });
