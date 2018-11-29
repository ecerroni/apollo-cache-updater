/* eslint-disable no-unused-vars, no-undef */

import React from "react";
import { render, cleanup, wait } from "react-testing-library";

import { ApolloProvider } from "react-apollo";
import ApolloCacheUpdater from "..";
import createClient from "./mocks";
import fixtures from "./fixtures";

import StoriesList from "./components/StoriesList";

const { stories } = fixtures;
const initialPublishedStoriesCount = stories.filter(s => s.published).length;

afterEach(cleanup);

test("should mount without blowing up", () => {
  const { getByText, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
});

test("should list all stories", async () => {
  const { container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = container.querySelector('[data-test="published-count"]');
  expect(count.innerHTML).toBe(initialPublishedStoriesCount.toString());

  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  ).length;
  expect(publishedStories).toBe(initialPublishedStoriesCount);
});
