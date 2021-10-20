import {buildSchema} from 'graphql';
import {plugin} from '../src/index';

describe(plugin.name, () => {
  const checkSimilarString = (a: string, b: string) => {
    const normalize = (str: string) => str.replace(/\s/g, '');
    expect(normalize(a)).toBe(normalize(b));
  };

  const checkOutput = async (input: string, output: string) => {
    const schema = buildSchema(input);
    const content = await plugin(schema, [], {includeDirectives: false});
    checkSimilarString(content.toString(), output);
  };

  describe('return scalar query', () => {
    it('return correct output', async () => {
      await checkOutput(
        /* GraphQL */ `
          type Query {
            hello1: String
            hello2: String!
          }
        `,
        /* GraphQL */ `
          query hello1 {
            hello1
          }
          query hello2 {
            hello2
          }
        `
      );
    });
  });

  describe('return object query', () => {
    it('return correct output', async () => {
      await checkOutput(
        /* GraphQL */ `
          type User {
            id: Int
            name: String
          }

          type Query {
            me1: User
            me2: User!
          }
        `,
        /* GraphQL */ `
          query me1 {
            me1 {
              id
              name
            }
          }
          query me2 {
            me2 {
              id
              name
            }
          }
        `
      );
    });
  });

  describe('return array query', () => {
    it('return correct output', async () => {
      await checkOutput(
        /* GraphQL */ `
          type User {
            id: Int
            name: String
          }

          type Query {
            hellos1: [String]
            hellos2: [String!]!
            users1: [User]
            users2: [User!]!
          }
        `,
        /* GraphQL */ `
          query hellos1 {
            hellos1
          }
          query hellos2 {
            hellos2
          }
          query users1 {
            users1 {
              id
              name
            }
          }
          query users2 {
            users2 {
              id
              name
            }
          }
        `
      );
    });
  });
});
