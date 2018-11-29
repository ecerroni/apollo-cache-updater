import GraphQLJSON from "graphql-type-json"; // eslint-disable-line

export default `

  scalar JSON

  input inputStoryStatus {
    _id: ID!
    published: Boolean!
    flagged: Boolean!
  }

  type Story {
    _id: ID!
    title: String
    published: Boolean
    flagged: Boolean
  }

  type Query {    
    # Arguments
    # sort:
    # limit:
    # start:
    # where:
    stories(sort: String, limit: Int, start: Int, where: JSON): [Story]

    storiesCount(where: JSON): Int
  }

  type Mutation {
      setStoryStatus(input: inputStoryStatus!): Story
  }
`;
