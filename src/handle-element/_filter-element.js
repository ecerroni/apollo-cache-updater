import { getTypeOfElementItems } from "../_helpers";

export default ({
  element,
  action = "equal",
  mutationResult,
  ID,
  queryName,
  errors
}) => {
  const typeOfElementItems = getTypeOfElementItems({
    element,
    ID,
    queryName,
    errors
  });
  return element.filter(e => {
    switch (typeOfElementItems) {
      case "string" || "number":
        if (action === "not-equal") return e !== mutationResult;
        return e === mutationResult;
      case "object":
        if (action === "not-equal") return e[ID] !== mutationResult[ID];
        return e[ID] === mutationResult[ID];
      default:
        return true;
    }
  });
};
