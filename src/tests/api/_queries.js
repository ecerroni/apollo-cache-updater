import gql from "graphql-tag";

export const stories = gql`
  query stories($sort: String, $limit: Int, $start: Int, $where: JSON) {
    stories(sort: $sort, limit: $limit, start: $start, where: $where) {
      _id
      title
      published
      flagged
    }
  }
`;

export const storiesCount = gql`
  query storiesCount($where: JSON) {
    storiesCount(where: $where)
  }
`;
