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
const initialNoParamsStoriesCount = stories.length;

const spyError = jest.spyOn(global.console, 'error');
const spyWarn = jest.spyOn(global.console, 'warn');
beforeEach(() => {
  spyError.mockReset();
  spyWarn.mockReset();
});

afterEach(cleanup);

test('should ADD a story to the TOP published and TOP noParams', async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText('Add_Published_TOP'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );
  const noParamsStories = container.querySelectorAll(
    '[data-test="no-params-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const noParamsStoriesArr = noParamsStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const countPublished = getByTestId('published-count');
  const countNoParams = getByTestId('no-params-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();

  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount + 1).toString()
  );
  expect(countNoParams.innerHTML).toBe(initialNoParamsStoriesCount.toString());
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount + 1);
  expect(publishedStoriesArr[0]).toBe(addedStory.title);
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount);
  expect(noParamsStoriesArr[0]).toBe(stories[0].title);
});

test('should REMOVE a story from published && noParams', async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText('Remove_Published'));
  const completed = await waitForElement(() => getByTestId('completed'));
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );
  const noParamsStories = container.querySelectorAll(
    '[data-test="no-params-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const noParamsStoriesArr = noParamsStories.map(
    el => el.querySelector('[data-test]', 'title').innerHTML
  );

  const countPublished = getByTestId('published-count');
  const countNoParams = getByTestId('no-params-count');
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(spyError).not.toHaveBeenCalled();

  expect(countPublished.innerHTML).toBe(
    (initialPublishedStoriesCount - 1).toString()
  );
  expect(countNoParams.innerHTML).toBe(initialNoParamsStoriesCount.toString());
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount - 1);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[1].title
  );
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount);
  expect(noParamsStoriesArr[0]).toBe(stories[0].title);
});
