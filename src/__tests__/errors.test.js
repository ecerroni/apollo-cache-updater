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
import { ERRORS, WARNINGS } from '../messages';
import StoriesList from '../__components__/StoriesList';

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
  const completed = await waitForElement(() => getByTestId('completed'));
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(console.error).toHaveBeenCalled();
  return (
    console.error.mock.calls[0][0].filter(e => e.includes(error)).length > 0
  );
};

const testWarning = async warning => {
  fireEvent.click(getByText(warning));
  const completed = await waitForElement(() => getByTestId('completed'));
  expect(completed.innerHTML).toBe('Mutation: completed');
  expect(console.warn).toHaveBeenCalled();
  return (
    console.warn.mock.calls.filter(e => e[0] && e[0].includes(warning)).length >
    0
  );
};

test(`should throw error: ${ERRORS.MUTATION_RESULT.MISSING_ID}`, async () => {
  const error = await testError(ERRORS.MUTATION_RESULT.MISSING_ID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.MUTATION_RESULT.MANDATORY}`, async () => {
  const error = await testError(ERRORS.MUTATION_RESULT.MANDATORY);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.MUTATION_RESULT.NO_ARRAY}`, async () => {
  const error = await testError(ERRORS.MUTATION_RESULT.NO_ARRAY);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SWITCH_VARIABLES.NO_NESTING}`, async () => {
  const error = await testError(ERRORS.SWITCH_VARIABLES.NO_NESTING);
  expect(error).toBeTruthy();
});

test(`should throw error: ${
  ERRORS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE
}`, async () => {
  const error = await testError(ERRORS.SWITCH_VARIABLES.MANDATORY_FOR_MOVE);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.INVALID_ROW}`, async () => {
  const error = await testError(ERRORS.OPERATION.INVALID_ROW);
  expect(error).toBeTruthy();
});

test(`should throw error: ${
  ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION
}`, async () => {
  const error = await testError(ERRORS.OPERATION.CUSTOM_ADD_NO_FUNCTION);
  expect(error).toBeTruthy();
});

test(`should throw error: ${
  ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION
}`, async () => {
  const error = await testError(ERRORS.OPERATION.CUSTOM_REMOVE_NO_FUNCTION);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.NOT_VALID}`, async () => {
  const error = await testError(ERRORS.OPERATION.NOT_VALID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SEARCH_VARIABLES.MANDATORY}`, async () => {
  const error = await testError(ERRORS.SEARCH_VARIABLES.MANDATORY);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SEARCH_VARIABLES.NO_NESTING}`, async () => {
  const error = await testError(ERRORS.SEARCH_VARIABLES.NO_NESTING);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.SEARCH_VARIABLES.INVALID}`, async () => {
  const error = await testError(ERRORS.SEARCH_VARIABLES.INVALID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${WARNINGS.SEARCH_OPERATOR.NOT_VALID}`, async () => {
  const error = await testWarning(WARNINGS.SEARCH_OPERATOR.NOT_VALID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${
  WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING
}`, async () => {
  const error = await testWarning(WARNINGS.SEARCH_OPERATOR.MUST_BE_STRING);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.MISSING_SORT_FIELD}`, async () => {
  const error = await testError(ERRORS.OPERATION.MISSING_SORT_FIELD);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.OPERATION.WRONG_SORT_FIELD}`, async () => {
  const error = await testError(ERRORS.OPERATION.WRONG_SORT_FIELD);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.QUERY.MISMATCH_ID}`, async () => {
  const error = await await testError(ERRORS.QUERY.MISMATCH_ID);
  expect(error).toBeTruthy();
});

test(`should throw error: ${ERRORS.QUERY.MISSING_ID}`, async () => {
  const error = await testError(ERRORS.QUERY.MISSING_ID);
  expect(error).toBeTruthy();
});
