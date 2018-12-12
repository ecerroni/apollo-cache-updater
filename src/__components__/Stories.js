/* eslint-disable no-underscore-dangle */
import React from "react"; // eslint-disable-line

export default ({
  stories = [],
  actions = {
    first: { move: () => {}, label: '' },
    second: { move: () => {}, label: '' },
  },
  modifiers = ['TOP', 'BOTTOM', 'SORT'],
}) => {
  const args = {
    first: {},
    second: {},
  };
  let dataTest;
  switch (actions.second.label) {
    case 'Archive':
      args.second = { from: 'publish', to: 'archive' };
      break;
    case 'Delete':
    default:
      break;
  }
  switch (actions.first.label) {
    case 'Unpublish':
      dataTest = 'published-stories';
      args.first = { from: 'publish', to: 'unpublish' };
      break;
    case 'Publish':
      dataTest = 'unpublished-stories';
      args.first = { from: 'unpublish', to: 'publish' };
      break;
    case 'Republish':
      dataTest = 'archived-stories';
      args.first = { from: 'archive', to: 'publish' };
      break;
    case 'Default':
      dataTest = 'no-params-stories';
      break;
    default:
      dataTest = '';
      break;
  }

  const rendered =
    stories && stories.length > 0 // eslint-disable-next-line
      ? stories.map((s, i) => (<div key={`${dataTest}_${s._id}-${i}`} data-test={dataTest}>
            <span>
              <strong data-test="title">{s.title}</strong>
            </span>
            {modifiers.map(m => (
              <React.Fragment key={m}>
                <span
                  onClick={() =>
                    actions.first.move({ ...args.first, modifier: m })
                  }
                >
                  {' '}
                  {actions.first.label}_{s._id}_{m}
                </span>
                <span
                  onClick={() =>
                    actions.second.move({ ...args.second, modifier: m })
                  }
                >
                  {' '}
                  {actions.second.label}_{s._id}_{m}
                </span>
              </React.Fragment>
            ))}
          </div>
        ))
      : null;
  return rendered;
};
