const package = require('../package.json');
const assert = require('assert');

beforeEach(() => {
});

before(() => {
});

after(() => {
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe(`${package.name}`, () => {
  const resolver = new (require('../dist/index.js'))();

  // Method
  describe('.resolve()', () => {

    // Method tests
    describe('blank account', () => {
      const account = resolver.resolve()

      it('plan.id === basic', () => {
        return account.plan.id === 'basic';
      });

    });

    // Method tests
    describe('filled account, old expire date', () => {
      const account = resolver.resolve(undefined, {
        plan: {
          id: 'premium',
        }
      })

      it('plan.id === basic', () => {
        return account.plan.id === 'basic';
      });

    });

    // Method tests
    describe('filled account, future expire date', () => {
      const account = resolver.resolve(undefined, {
        plan: {
          id: 'premium',
          expires: {
            timestamp: '9999-01-01T00:00:00.000Z',
            timestampUNIX: 253370764800,
          }
        }
      })

      it('plan.id === premium', () => {
        return account.plan.id === 'premium';
      });

    });

  });

})
