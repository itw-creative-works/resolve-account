const package = require('../package.json');
const assert = require('assert');
const resolveAccount = require('../dist/index.js');

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

  describe('Basic functionality', () => {
    
    it('should handle empty input', () => {
      const account = resolveAccount();
      assert.strictEqual(account.auth.uid, null);
      assert.strictEqual(account.auth.email, null);
      assert.strictEqual(account.subscription.status, 'inactive');
      assert.strictEqual(account.subscription.access, false);
    });

    it('should handle null input', () => {
      const account = resolveAccount(null, null);
      assert.strictEqual(account.auth.uid, null);
      assert.strictEqual(account.auth.email, null);
      assert.strictEqual(account.subscription.status, 'inactive');
    });

    it('should preserve existing data', () => {
      const rawData = {
        customField: 'test',
        personal: {
          name: {
            first: 'John'
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.customField, 'test');
      assert.strictEqual(account.personal.name.first, 'John');
      assert.strictEqual(account.personal.name.last, ''); // Should have default
    });
  });

  describe('Auth fields', () => {
    
    it('should use Firebase user uid and email', () => {
      const firebaseUser = {
        uid: 'test-uid-123',
        email: 'test@example.com'
      };
      const account = resolveAccount({}, firebaseUser);
      assert.strictEqual(account.auth.uid, 'test-uid-123');
      assert.strictEqual(account.auth.email, 'test@example.com');
      assert.strictEqual(account.auth.temporary, false);
    });

    it('should preserve existing auth over Firebase user', () => {
      const rawData = {
        auth: {
          uid: 'existing-uid',
          email: 'existing@example.com'
        }
      };
      const firebaseUser = {
        uid: 'firebase-uid',
        email: 'firebase@example.com'
      };
      const account = resolveAccount(rawData, firebaseUser);
      assert.strictEqual(account.auth.uid, 'existing-uid');
      assert.strictEqual(account.auth.email, 'existing@example.com');
    });
  });

  describe('Subscription structure', () => {
    
    it('should have all subscription fields with defaults', () => {
      const account = resolveAccount();
      
      // IDs
      assert.strictEqual(account.subscription.id, null);
      assert.strictEqual(account.subscription.orderNumber, null);
      assert.strictEqual(account.subscription.app, null);
      assert.strictEqual(account.subscription.product, null);
      assert.strictEqual(account.subscription.intent, null);
      
      // Status
      assert.strictEqual(account.subscription.type, 'subscription');
      assert.strictEqual(account.subscription.status, 'inactive');
      assert.strictEqual(account.subscription.access, false);
      assert.strictEqual(account.subscription.frequency, 'monthly');
      
      // Customer
      assert.strictEqual(account.subscription.customer.id, null);
      assert.strictEqual(account.subscription.customer.email, null);
      
      // Processor
      assert.strictEqual(account.subscription.processor.id, null);
      assert.strictEqual(account.subscription.processor.priceId, null);
      
      // Billing
      assert.strictEqual(account.subscription.billing.amount, 0);
      assert.strictEqual(account.subscription.billing.currency, 'usd');
      assert.strictEqual(account.subscription.billing.interval, 1);
      
      // Trial
      assert.strictEqual(account.subscription.trial.eligible, false);
      assert.strictEqual(account.subscription.trial.used, false);
      assert.strictEqual(account.subscription.trial.days, 0);
      
      // Cancellation
      assert.strictEqual(account.subscription.cancellation.requested, false);
      assert.strictEqual(account.subscription.cancellation.reason, null);
    });

    it('should calculate access for active subscription', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const rawData = {
        subscription: {
          status: 'active',
          billing: {
            currentPeriodEnd: {
              timestamp: futureDate.toISOString(),
              timestampUNIX: Math.round(futureDate.getTime() / 1000)
            }
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.status, 'active');
      assert.strictEqual(account.subscription.access, true);
    });

    it('should deny access for expired subscription', () => {
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const rawData = {
        subscription: {
          status: 'active',
          billing: {
            currentPeriodEnd: {
              timestamp: pastDate.toISOString(),
              timestampUNIX: Math.round(pastDate.getTime() / 1000)
            }
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.status, 'active');
      assert.strictEqual(account.subscription.access, false);
    });

    it('should handle trialing status', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const rawData = {
        subscription: {
          status: 'trialing',
          billing: {
            currentPeriodEnd: {
              timestamp: futureDate.toISOString(),
              timestampUNIX: Math.round(futureDate.getTime() / 1000)
            }
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.status, 'trialing');
      assert.strictEqual(account.subscription.access, true);
    });
  });

  describe('Timestamp handling', () => {
    
    it('should have null timestamps by default', () => {
      const account = resolveAccount();
      assert.strictEqual(account.subscription.billing.currentPeriodEnd.timestamp, null);
      assert.strictEqual(account.subscription.billing.currentPeriodEnd.timestampUNIX, null);
      assert.strictEqual(account.subscription.trial.startedAt.timestamp, null);
      assert.strictEqual(account.subscription.trial.startedAt.timestampUNIX, null);
    });

    it('should normalize timestamps to have both fields', () => {
      const testDate = '2024-01-15T10:30:00.000Z';
      const testUnix = Math.round(new Date(testDate).getTime() / 1000);
      
      const rawData = {
        subscription: {
          meta: {
            created: {
              timestamp: testDate
              // Missing timestampUNIX - should be calculated
            }
          }
        }
      };
      
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.meta.created.timestamp, testDate);
      assert.strictEqual(account.subscription.meta.created.timestampUNIX, testUnix);
    });

    it('should handle invalid timestamps', () => {
      const rawData = {
        subscription: {
          meta: {
            created: {
              timestamp: 'invalid-date'
            }
          }
        }
      };
      
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.meta.created.timestamp, null);
      assert.strictEqual(account.subscription.meta.created.timestampUNIX, null);
    });
  });

  describe('Roles handling', () => {
    
    it('should default all roles to false', () => {
      const account = resolveAccount();
      assert.strictEqual(account.roles.betaTester, false);
      assert.strictEqual(account.roles.developer, false);
      assert.strictEqual(account.roles.admin, false);
      assert.strictEqual(account.roles.vip, false);
      assert.strictEqual(account.roles.og, false);
      assert.strictEqual(account.roles.promoExempt, false);
    });

    it('should convert string "true" to boolean true', () => {
      const rawData = {
        roles: {
          betaTester: 'true',
          developer: true,
          admin: 'false',
          vip: false
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.roles.betaTester, true);
      assert.strictEqual(account.roles.developer, true);
      assert.strictEqual(account.roles.admin, false);
      assert.strictEqual(account.roles.vip, false);
    });
  });

  describe('Affiliate structure', () => {
    
    it('should have default affiliate values', () => {
      const account = resolveAccount();
      assert.strictEqual(account.affiliate.code, 'unknown');
      assert.deepStrictEqual(account.affiliate.referrals, []);
      assert.strictEqual(account.affiliate.referrer, 'unknown');
    });

    it('should preserve affiliate data', () => {
      const rawData = {
        affiliate: {
          code: 'PROMO123',
          referrals: ['user1', 'user2'],
          referrer: 'influencer'
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.affiliate.code, 'PROMO123');
      assert.deepStrictEqual(account.affiliate.referrals, ['user1', 'user2']);
      assert.strictEqual(account.affiliate.referrer, 'influencer');
    });
  });

  describe('Activity and geolocation', () => {
    
    it('should have default activity values', () => {
      const account = resolveAccount();
      assert.strictEqual(account.activity.geolocation.ip, 'unknown');
      assert.strictEqual(account.activity.geolocation.country, 'unknown');
      assert.strictEqual(account.activity.geolocation.latitude, 0);
      assert.strictEqual(account.activity.client.userAgent, 'unknown');
      assert.strictEqual(account.activity.client.mobile, null);
    });

    it('should preserve activity data', () => {
      const rawData = {
        activity: {
          geolocation: {
            ip: '192.168.1.1',
            country: 'US',
            latitude: 37.7749
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.activity.geolocation.ip, '192.168.1.1');
      assert.strictEqual(account.activity.geolocation.country, 'US');
      assert.strictEqual(account.activity.geolocation.latitude, 37.7749);
      // Should still have defaults for missing fields
      assert.strictEqual(account.activity.geolocation.city, 'unknown');
    });
  });

  describe('Personal information', () => {
    
    it('should have default personal values', () => {
      const account = resolveAccount();
      assert.strictEqual(account.personal.name.first, '');
      assert.strictEqual(account.personal.name.last, '');
      assert.strictEqual(account.personal.gender, '');
      assert.strictEqual(account.personal.telephone.countryCode, 0);
    });

    it('should preserve personal data', () => {
      const rawData = {
        personal: {
          name: {
            first: 'Jane',
            last: 'Doe'
          },
          gender: 'female',
          company: {
            name: 'Tech Corp'
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.personal.name.first, 'Jane');
      assert.strictEqual(account.personal.name.last, 'Doe');
      assert.strictEqual(account.personal.gender, 'female');
      assert.strictEqual(account.personal.company.name, 'Tech Corp');
      assert.strictEqual(account.personal.company.position, ''); // Should have default
    });
  });

  describe('Deep merge behavior', () => {
    
    it('should not overwrite existing values with defaults', () => {
      const rawData = {
        subscription: {
          id: 'sub_123',
          customer: {
            email: 'customer@example.com'
          }
        },
        personal: {
          name: {
            first: 'Test'
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.id, 'sub_123');
      assert.strictEqual(account.subscription.customer.email, 'customer@example.com');
      assert.strictEqual(account.subscription.customer.name, null); // Should get default
      assert.strictEqual(account.personal.name.first, 'Test');
      assert.strictEqual(account.personal.name.last, ''); // Should get default
    });

    it('should handle nested objects correctly', () => {
      const rawData = {
        subscription: {
          billing: {
            amount: 999,
            lastPayment: {
              amount: 999,
              status: 'succeeded'
            }
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.subscription.billing.amount, 999);
      assert.strictEqual(account.subscription.billing.currency, 'usd'); // Default
      assert.strictEqual(account.subscription.billing.lastPayment.amount, 999);
      assert.strictEqual(account.subscription.billing.lastPayment.status, 'succeeded');
    });
  });

  describe('Extra fields preservation', () => {
    
    it('should preserve fields not in the schema', () => {
      const rawData = {
        customField: 'custom value',
        subscription: {
          customSubscriptionField: 'test'
        },
        personal: {
          customPersonalField: {
            nested: 'value'
          }
        }
      };
      const account = resolveAccount(rawData);
      assert.strictEqual(account.customField, 'custom value');
      assert.strictEqual(account.subscription.customSubscriptionField, 'test');
      assert.deepStrictEqual(account.personal.customPersonalField, { nested: 'value' });
    });
  });

});