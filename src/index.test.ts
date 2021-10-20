import {buildSchema} from 'graphql';
import {plugin} from '../src/index';

describe('graphql-codegen-default-queries', () => {
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
              hello: String!
            }
          `,
          /* GraphQL */ `
            query hello {
              hello
            }
          `
        );

        await checkOutput(
          /* GraphQL */ `
            type Query {
              hello: String
            }
          `,
          /* GraphQL */ `
            query hello {
              hello
            }
          `
        );
      });
    });
  });
});
