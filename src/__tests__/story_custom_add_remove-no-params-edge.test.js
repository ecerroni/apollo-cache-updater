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

test('should ADD a story to the BOTTOM published && noParams with customAdd', async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList
        noParams={true}
        customAdd={({ data, query, type, variables }) => {
          if (type === 'array') {
            return [
              ...data,
              {
                _id: 7,
                title: 'Yo!',
                published: true,
                flagged: false,
                __typename: 'Story',
              },
            ];
          }
          if (type === 'number') {
            return data + 2;
          }
          return undefined;
        }}
      />
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
    (initialPublishedStoriesCount + 2).toString()
  );
  expect(countNoParams.innerHTML).toBe(
    (initialNoParamsStoriesCount + 2).toString()
  );
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount + 1);
  expect(publishedStoriesArr[publishedStoriesArr.length - 1]).toBe('Yo!');
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount + 1);
  expect(noParamsStoriesArr[noParamsStoriesArr.length - 1]).toBe('Yo!');
});

test('should NOT REMOVE a story from published && noParams because of customRemove', async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList
        noParams={true}
        customRemove={({ data, query, type, variables }) => data}
      />
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
    initialPublishedStoriesCount.toString()
  );
  expect(countNoParams.innerHTML).toBe(initialNoParamsStoriesCount.toString());
  expect(publishedStoriesArr.length).toBe(initialPublishedStoriesCount);
  expect(publishedStoriesArr[0]).toBe(
    stories.filter(s => s.published)[0].title
  );
  expect(noParamsStoriesArr.length).toBe(initialNoParamsStoriesCount);
  expect(noParamsStoriesArr[0]).toBe(stories[0].title);
});
