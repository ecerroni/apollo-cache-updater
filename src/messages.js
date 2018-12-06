export const ERRORS = {
  MUTATION_RESULT: {
    MISSING_ID: "[mutaion-result_missing-id]",
    NO_ARRAY: "[mutation-result_no-array]",
    MANDATORY: "[mutation-result_mandatory]"
  },
  SWITCH_VARIABLES: {
    NO_NESTING: "[switch-variables_no-nesting]"
  },
  SEARCH_VARIABLES: {
    MANDATORY: "[search-variables_mandatory]",
    NO_NESTING: "[search-variables_no-nesting]",
    INVALID: "[search-variables_invalid]"
  },
  QUERY: {
    MISSING_ID: "[query_missing-id]"
  },
  OPERATION: {
    NOT_VALID: "[operation_not-valid]",
    INVALID_ROW: "[operation_invalid-row]",
    CUSTOM_ADD_NO_FUNCTION: "[operation_custom-add-no-func]",
    CUSTOM_REMOVE_NO_FUNCTION: "[operation_custom-remove-no-func]"
  }
};

export const WARNINGS = {
  SEARCH_OPERATOR: {
    NOT_VALID: "[search-operator_not-valid]",
    MUST_BE_STRING: "[search-operator_must-be-string]"
  },
  SWITCH_VARIABLES: {
    MANDATORY_FOR_MOVE: "[switch-variables_mandatory-for-move-op]"
  }
};
