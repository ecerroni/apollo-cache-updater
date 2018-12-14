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
const initialNoParamsStoriesCount = stories.length;

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
      <StoriesList noParamsEdge={true} />
    </ApolloProvider>
  );
  getByText = gbt;
  getByTestId = gbti;
  container = c;
  await wait();
});

afterEach(cleanup);

test('should move a story from published to the TOP archive', async () => {
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
  expect(archivedStoriesArr[0]).toBe(stories.filter(s => s.published)[0].title);
  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount - 1).toString()
  );
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount - 1);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[1].title
  );
});

test('should move a story from Published to the TOP Unpublish', async () => {
  fireEvent.click(getByText('Unpublish_1_TOP'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const unpublishedStories = container.querySelectorAll(
    '[data-test="unpublished-stories"]'
  );
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const unpublishedStoriesArr = unpublishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );
  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const countUnpublished = getByTestId('unpublished-count');
  const countPublished = getByTestId('published-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();
  expect(countUnpublished.innerHTML).toBe(
    (initialUnpublishedStoriesCount + 1).toString()
  );
  expect(unpublishedStoriesArr.length).toBe(initialUnpublishedStoriesCount + 1);
  expect(unpublishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[0].title
  );
  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount - 1).toString()
  );
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount - 1);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[1].title
  );
});

test('should move a story from published to the BOTTOM of archive', async () => {
  fireEvent.click(getByText('Archive_1_BOTTOM'));
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

  const count = getByTestId('archived-count');
  const countPublished = getByTestId('published-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();
  expect(count.innerHTML).toBe((initialArchivedStoriesCount + 1).toString());
  expect(archivedStoriesArr.length).toBe(initialArchivedStoriesCount + 1);
  expect(archivedStoriesArr[archivedStoriesArr.length - 1]).toBe(
    stories.filter(s => s.published)[0].title
  );
  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount - 1).toString()
  );
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount - 1);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[1].title
  );
});

test('should move a story from published to the archive ORDERING it by title', async () => {
  fireEvent.click(getByText('Archive_1_SORT'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const count = getByTestId('archived-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();
  expect(count.innerHTML).toBe((initialArchivedStoriesCount + 1).toString());
  expect(archivedStoriesArr.length).toBe(initialArchivedStoriesCount + 1);
  expect(archivedStoriesArr[1]).toBe(stories.filter(s => s.published)[0].title);
});

test('should add/remove a story from stories with no params edge', async () => {
  fireEvent.click(getByText('Archive_1_TOP'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const noParamsStories = container.querySelectorAll(
    '[data-test="no-params-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const noParamsStoriesArr = noParamsStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const count = getByTestId('no-params-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();
  expect(count.innerHTML).toBe(initialNoParamsStoriesCount.toString());
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount);
  expect(noParamsStoriesArr[0]).toBe(stories.filter(s => s.published)[0].title);
});
