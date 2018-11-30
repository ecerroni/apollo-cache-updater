/* eslint-disable no-unused-vars, no-undef */

import React from "react";
import {
  render,
  cleanup,
  wait,
  fireEvent,
  waitForElement
} from "react-testing-library";

import { ApolloProvider } from "react-apollo";
import createClient from "./mocks";
import fixtures from "./fixtures";

import StoriesList from "./components/StoriesList";

const { stories } = fixtures;
const initialPublishedStoriesCount = stories.filter(s => s.published).length;
const initialUnpublishedStoriesCount = stories.filter(
  s => !s.published && !s.flagged
).length;

const initialArchivedStoriesCount = stories.filter(s => s.flagged).length;

console.log(
  `[publishedStories: ${initialPublishedStoriesCount}] | [unpublishedStories: ${initialUnpublishedStoriesCount}] | [archivedStories: ${initialArchivedStoriesCount}]`
);
const spyError = jest.spyOn(global.console, "error");
const spyWarn = jest.spyOn(global.console, "warn");
beforeEach(() => {
  spyError.mockReset();
  spyWarn.mockReset();
});

afterEach(cleanup);

test("should mount without blowing up", () => {
  const { getByText, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
});

test("should list all published stories", async () => {
  const { getByTestId, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = getByTestId("published-count"); // container.querySelector('[data-testid="published-count"]');
  expect(count.innerHTML).toBe(initialPublishedStoriesCount.toString());

  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  ).length;
  expect(publishedStories).toBe(initialPublishedStoriesCount);
});

test("should list all unpublished stories", async () => {
  const { getByTestId, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = getByTestId("unpublished-count"); // container.querySelector('[data-test="unpublished-count"]');
  expect(count.innerHTML).toBe(initialUnpublishedStoriesCount.toString());

  const unpublishedStories = container.querySelectorAll(
    '[data-test="unpublished-stories"]'
  ).length;
  expect(unpublishedStories).toBe(initialUnpublishedStoriesCount);
});

test("should list all archived stories", async () => {
  const { getByTestId, container } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();
  const count = getByTestId("archived-count"); // container.querySelector('[data-test="archived-count"]');
  expect(count.innerHTML).toBe(initialArchivedStoriesCount.toString());

  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  ).length;
  expect(archivedStories).toBe(initialArchivedStoriesCount);
});

test("should throw errors", async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();

  const archivedStories = container.querySelectorAll(
    "[data-test]",
    "archived-stories"
  ).length;
  fireEvent.click(getByText("Missing Switch"));
  const completed = await waitForElement(() => getByTestId("completed"));
  expect(completed.innerHTML).toBe("Mutation: completed");
  expect(spyError).toHaveBeenCalled();
});
