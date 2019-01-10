/* eslint-disable no-unused-vars, no-undef */

import React from 'react';
import {
  render,
  cleanup,
  wait,
  fireEvent,
  waitForElement,
} from 'react-testing-library';

import { ApolloProvider } from 'react-apollo';
import createClient from '../__mocks__';
import fixtures from '../__fixtures__';

import StoriesList from '../__components__/StoriesList';

const { stories } = fixtures;
const initialPublishedStoriesCount = stories.filter(s => s.published).length;
const initialUnpublishedStoriesCount = stories.filter(
  s => !s.published && !s.flagged
).length;

const initialArchivedStoriesCount = stories.filter(s => s.flagged).length;
const spyError = jest.spyOn(global.console, 'error');
const spyWarn = jest.spyOn(global.console, 'warn');

let getByTestId;
let getByText;
let container;

beforeEach(async () => {
  spyError.mockReset();
  spyWarn.mockReset();
  const { getByText: gbt, getByTestId: gbti, container: c } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList newValue={true} />
    </ApolloProvider>
  );
  getByText = gbt;
  getByTestId = gbti;
  container = c;
  await wait();
});

afterEach(cleanup);

test('should move a story from published to the TOP archive with new values', async () => {
  fireEvent.click(getByText('Archive_1_TOP'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );
  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const countArchived = getByTestId('archived-count');
  const countPublished = getByTestId('published-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();
  expect(countArchived.innerHTML).toBe(
    (initialArchivedStoriesCount + 1).toString()
  );
  expect(archivedStoriesArr.length).toBe(initialArchivedStoriesCount + 1);
  expect(archivedStoriesArr[0]).toBe('New title');
  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount - 1).toString()
  );
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount - 1);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[1].title
  );
});
