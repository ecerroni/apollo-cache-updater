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

const { stories, addedStory } = fixtures;
const initialPublishedStoriesCount = stories.filter(s => s.published).length;
const initialUnpublishedStoriesCount = stories.filter(
  s => !s.published && !s.flagged
).length;
const initialArchivedStoriesCount = stories.filter(s => s.flagged).length;
const initialNoParamsStoriesCount = stories.length;

const spyError = jest.spyOn(global.console, 'error');
const spyWarn = jest.spyOn(global.console, 'warn');
beforeEach(() => {
  spyError.mockReset();
  spyWarn.mockReset();
});

afterEach(cleanup);

test('should ADD a story to the TOP published and TOP unpublished and TOP archive', async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList any={true} />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText('Add_Published_TOP'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );
  const unpublishedStories = container.querySelectorAll(
    '[data-test="unpublished-stories"]'
  );
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );
  const noParamsStories = container.querySelectorAll(
    '[data-test="no-params-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );
  const unpublishedStoriesArr = unpublishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );
  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const noParamsStoriesArr = noParamsStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const countPublished = getByTestId('published-count');
  const countUnpublished = getByTestId('unpublished-count');
  const countArchived = getByTestId('archived-count');
  const countNoParams = getByTestId('no-params-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();

  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount + 1).toString()
  );
  expect(countUnpublished.innerHTML).toBe(
    (initialUnpublishedStoriesCount + 1).toString()
  );
  expect(countArchived.innerHTML).toBe(
    (initialArchivedStoriesCount + 1).toString()
  );
  expect(countNoParams.innerHTML).toBe(initialNoParamsStoriesCount.toString());
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount + 1);
  expect(publishedStoriesArr[0]).toBe(addedStory.title);
  expect(unpublishedStoriesArr.length).toBe(initialUnpublishedStoriesCount + 1);
  expect(unpublishedStoriesArr[0]).toBe(addedStory.title);
  expect(archivedStoriesArr.length).toBe(initialArchivedStoriesCount + 1);
  expect(archivedStoriesArr[0]).toBe(addedStory.title);
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount);
  expect(noParamsStoriesArr[0]).toBe(stories[0].title);
});

test('should REMOVE a story from published, unpublised and archived', async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList any={true} />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText('Remove_Published'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );
  const unpublishedStories = container.querySelectorAll(
    '[data-test="unpublished-stories"]'
  );
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );
  const noParamsStories = container.querySelectorAll(
    '[data-test="no-params-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );
  const unpublishedStoriesArr = unpublishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );
  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const noParamsStoriesArr = noParamsStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const countPublished = getByTestId('published-count');
  const countUnpublished = getByTestId('unpublished-count');
  const countArchived = getByTestId('archived-count');
  const countNoParams = getByTestId('no-params-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();

  // expect(countPublished.innerHTML).toBe(
  //   (initialPublishedStoriesCount - 1).toString()
  // );
  // expect(countUnpublished.innerHTML).toBe(
  //   (initialUnpublishedStoriesCount - 1).toString()
  // );
  // expect(countArchived.innerHTML).toBe(
  //   (initialArchivedStoriesCount - 1).toString()
  // );
  // expect(countNoParams.innerHTML).toBe(initialNoParamsStoriesCount.toString());
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount - 1);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[1].title
  );
  expect(unpublishedStoriesArr.length).toBe(initialUnpublishedStoriesCount - 1);
  expect(unpublishedStoriesArr[0]).toBe(undefined);
  expect(archivedStoriesArr.length).toBe(initialArchivedStoriesCount - 1);
  expect(archivedStoriesArr[0]).toBe(stories.filter(s => s.flagged)[1].title);
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount);
  expect(noParamsStoriesArr[0]).toBe(stories[0].title);
});
