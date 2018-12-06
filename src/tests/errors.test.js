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
import { ERRORS, WARNINGS } from "../messages";
import StoriesList from "./components/StoriesList";

let getByTestId;
let getByText;
console.error = jest.fn();
console.warn = jest.fn();

beforeEach(async () => {
  console.error.mockReset();
  const { getByText: gbt, getByTestId: gbti } = render(
    <ApolloProvider client={createClient()}>
      <StoriesList />
    </ApolloProvider>
  );
  getByText = gbt;
  getByTestId = gbti;
  await wait();
});
afterEach(cleanup);

const testError = async error => {
  fireEvent.click(getByText(error));
  const completed = await waitForElement(() => getByTestId("completed"));
  expect(completed.innerHTML).toBe("Mutation: completed");
  expect(console.error).toHaveBeenCalled();
  return (
    console.error.mock.calls[0][0].filter(e => e.includes(error)).length > 0
  );
};

const testWarning = async warning => {
  fireEvent.click(getByText(warning));
  const completed = await waitForElement(() => getByTestId("completed"));
  expect(completed.innerHTML).toBe("Mutation: completed");
  expect(console.warning).toHaveBeenCalled();
  return (
    console.warning.mock.calls[0][0].filter(e => e.includes(error)).length > 0
  );
};

test(`should throw error: ${ERRORS.MUTATION_RESULT.MISSING_ID}`, () => {
  const error = testError(ERRORS.MUTATION_RESULT.MISSING_ID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.MUTATION_RESULT.NO_ARRAY}`, () => {
  const error = testError(ERRORS.MUTATION_RESULT.NO_ARRAY);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SWITCH_VARIABLES.NO_NESTING}`, () => {
  const error = testError(ERRORS.SWITCH_VARIABLES.NO_NESTING);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.QUERY.MISSING_ID}`, () => {
  const error = testError(ERRORS.QUERY.MISSING_ID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.INVALID_ROW}`, () => {
  const error = testError(ERRORS.OPERATION.INVALID_ROW);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION}`, () => {
  const error = testError(ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION);
  expect(error).toBeTruthy();
});

test(`should throw error: ${
  ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION
}`, () => {
  const error = testError(ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.NOT_VALID}`, () => {
  const error = testError(ERRORS.OPERATION.NOT_VALID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SEARCH_VARIABLES.MANDATORY}`, () => {
  const error = testError(ERRORS.SEARCH_VARIABLES.MANDATORY);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SEARCH_VARIABLES.NO_NESTING}`, () => {
  const error = testError(ERRORS.SEARCH_VARIABLES.NO_NESTING);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SEARCH_VARIABLES.INVALID}`, () => {
  const error = testError(ERRORS.SEARCH_VARIABLES.INVALID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.MUTATION_RESULT.MANDATORY}`, () => {
  const error = testError(ERRORS.MUTATION_RESULT.MANDATORY);
  expect(error).toBeTruthy();
});

test(`should throw error: ${WARNINGS.SEARCH_OPERATOR.NOT_VALID}`, () => {
  const error = testWarning(WARNINGS.SEARCH_OPERATOR.NOT_VALID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING}`, () => {
  const error = testWarning(WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING);
  expect(error).toBeTruthy();
});

test(`should throw error: ${
  WARNINGS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE
}`, () => {
  const error = testWarning(WARNINGS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE);
  expect(error).toBeTruthy();
});
