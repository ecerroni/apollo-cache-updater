/* eslint-disable no-underscore-dangle */
import React from "react"; // eslint-disable-line

export default ({
  stories = [],
  actions = {
    first: { move: () => {}, label: "" },
    second: { move: () => {}, label: "" }
  },
  modifiers = ["TOP", "BOTTOM", "SORT"]
}) => {
  let args = {};
  let dataTest;
  switch (actions.second.label) {
    case "Archive":
      args = { from: "publish", to: "archive" };
      break;
    case "Publish":
      args = { from: "unpublish", to: "publish" };
      break;
    default:
      break;
  }
  switch (actions.first.label) {
    case "Unpublish":
      dataTest = "published-stories";
      break;
    case "Publish":
      dataTest = "unpublished-stories";
      break;
    case "Republish":
      dataTest = "archived-stories";
      break;
    default:
      dataTest = "";
      break;
  }

  const rendered =
    stories && stories.length > 0 // eslint-disable-next-line
      ? stories.map(s => (<div key={s._id} data-test={dataTest}>
            <span>
              <strong data-test="title">{s.title}</strong>
            </span>
            {modifiers.map(m => (
              <React.Fragment key={m}>
                <span>
                  {" "}
                  {actions.first.label}_{s._id}_{m}
                </span>
                <span
                  onClick={() => actions.second.move({ ...args, modifier: m })}
                >
                  {" "}
                  {actions.second.label}_{s._id}_{m}
                </span>
              </React.Fragment>
            ))}
          </div>
        ))
      : null;
  return rendered;
};
