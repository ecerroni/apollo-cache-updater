import React from "react"; // eslint-disable-line

export default ({ stories = [], actions = { first: "", second: "" } }) => {
  const rendered =
    stories && stories.length > 0
      ? stories.map(s => (
          // eslint-disable-next-line
          <div key={s._id} data-test="published-stories">
            <span>
              <strong>{s.title}</strong>
            </span>
            <span> {actions.first}</span>
            <span> {actions.second}</span>
          </div>
        ))
      : null;
  return rendered;
};
