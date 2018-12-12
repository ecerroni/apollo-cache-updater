/* eslint-disable no-unused-vars, no-undef */

import React from 'react';
import { render, cleanup, wait } from 'react-testing-library';

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

afterEach(cleanup);

test('should mount without blowing up', () => {
  render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
});

test('should list all published stories', async () => {
  const { getByTestId, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = getByTestId('published-count'); // container.querySelector('[data-testid="published-count"]');
  expect(count.innerHTML).toBe(initialPublishedStoriesCount.toString());

  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  ).length;
  expect(publishedStories).toBe(initialPublishedStoriesCount);
});

test('should list all unpublished stories', async () => {
  const { getByTestId, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = getByTestId('unpublished-count'); // container.querySelector('[data-test="unpublished-count"]');
  expect(count.innerHTML).toBe(initialUnpublishedStoriesCount.toString());

  const unpublishedStories = container.querySelectorAll(
    '[data-test="unpublished-stories"]'
  ).length;
  expect(unpublishedStories).toBe(initialUnpublishedStoriesCount);
});

test('should list all archived stories', async () => {
  const { getByTestId, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = getByTestId('archived-count'); // container.querySelector('[data-test="archived-count"]');
  expect(count.innerHTML).toBe(initialArchivedStoriesCount.toString());

  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  ).length;
  expect(archivedStories).toBe(initialArchivedStoriesCount);
});
