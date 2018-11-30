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
const spyError = jest.spyOn(global.console, "error");
const spyWarn = jest.spyOn(global.console, "warn");
beforeEach(() => {
  spyError.mockReset();
  spyWarn.mockReset();
});

afterEach(cleanup);

test("should move a story from published to the TOP archive", async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText("Archive_1_TOP"));
  const completed = await waitForElement(() => getByTestId("completed"));
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector("[data-test]", "title").innerHTML
  );
  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector("[data-test]", "title").innerHTML
  );

  const countArchived = getByTestId("archived-count");
  const countPublished = getByTestId("published-count");
  expect(completed.innerHTML).toBe("Mutation: completed");
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

test("should move a story from published to the BOTTOM of archive", async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText("Archive_1_BOTTOM"));
  const completed = await waitForElement(() => getByTestId("completed"));
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );
  const publishedStories = container.querySelectorAll(
    '[data-test="published-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector("[data-test]", "title").innerHTML
  );
  const publishedStoriesArr = publishedStories.map(
    el => el.querySelector("[data-test]", "title").innerHTML
  );

  const count = getByTestId("archived-count");
  const countPublished = getByTestId("published-count");
  expect(completed.innerHTML).toBe("Mutation: completed");
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

test("should move a story from published to the archive ORDERING it by title", async () => {
  const { getByText, container, getByTestId } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  await wait();

  fireEvent.click(getByText("Archive_1_SORT"));
  const completed = await waitForElement(() => getByTestId("completed"));
  const archivedStories = container.querySelectorAll(
    '[data-test="archived-stories"]'
  );

  NodeList.prototype.map = Array.prototype.map;

  const archivedStoriesArr = archivedStories.map(
    el => el.querySelector("[data-test]", "title").innerHTML
  );

  const count = getByTestId("archived-count");
  expect(completed.innerHTML).toBe("Mutation: completed");
  expect(spyError).not.toHaveBeenCalled();
  expect(count.innerHTML).toBe((initialArchivedStoriesCount + 1).toString());
  expect(archivedStoriesArr.length).toBe(initialArchivedStoriesCount + 1);
  expect(archivedStoriesArr[1]).toBe(stories.filter(s => s.published)[0].title);
});
