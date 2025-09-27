/**
 * Resolve Account - Standardize account data structure
 * Ensures all required fields exist with proper defaults
 */

function resolveAccount(rawData, firebaseUser) {
  const user = firebaseUser || {};

  // Helper to create timestamp objects
  function createTimestamp(value = null) {
    if (value === null) {
      return { timestamp: null, timestampUNIX: null };
    }
    const date = new Date(value);
    return {
      timestamp: date.toISOString(),
      timestampUNIX: Math.round(date.getTime() / 1000)
    };
  }

  // Define the default schema
  const defaultSchema = {
    auth: {
      uid: user.uid || null,
      email: user.email || null,
      temporary: false
    },
    subscription: {
      // IDs
      id: null,
      orderNumber: null,
      app: null,
      product: 'basic',
      intent: null,

      // Type and status
      type: 'subscription',
      status: 'active',
      access: false,
      frequency: 'monthly',

      // Customer info
      customer: {
        id: null,
        email: null,
        name: null,
        address: null,
        phone: null
      },

      // Payment processor info
      processor: {
        id: null,
        priceId: null,
        productId: null,
        subscriptionItemId: null
      },

      // Billing info
      billing: {
        amount: 0,
        currency: 'usd',
        interval: 1,
        currentPeriodEnd: createTimestamp(),
        nextBillingDate: createTimestamp(),
        lastPayment: {
          amount: null,
          date: createTimestamp(),
          status: null
        }
      },

      // Trial info
      trial: {
        eligible: false,
        used: false,
        days: 0,
        startedAt: createTimestamp(),
        endedAt: createTimestamp()
      },

      // Cancellation info
      cancellation: {
        requested: false,
        requestedAt: createTimestamp(),
        effectiveAt: createTimestamp(),
        reason: null
      },

      // Metadata
      meta: {
        created: createTimestamp(),
        updated: createTimestamp()
      }
    },
    oauth2: {},
    roles: {
      betaTester: false,
      developer: false,
      admin: false,
      vip: false,
      og: false,
      promoExempt: false
    },
    affiliate: {
      code: 'unknown',
      referrals: [],
      referrer: 'unknown'
    },
    activity: {
      lastActivity: createTimestamp(),
      created: createTimestamp(),
      geolocation: {
        ip: 'unknown',
        continent: 'unknown',
        country: 'unknown',
        region: 'unknown',
        city: 'unknown',
        latitude: 0,
        longitude: 0
      },
      client: {
        userAgent: 'unknown',
        language: 'unknown',
        platform: 'unknown',
        mobile: null
      }
    },
    api: {
      clientId: 'unknown',
      privateKey: 'unknown'
    },
    usage: {
      requests: {
        total: 0,
        period: 0,
        last: {
          id: '',
          ...createTimestamp()
        }
      }
    },
    personal: {
      birthday: createTimestamp(),
      gender: '',
      location: {
        country: '',
        region: '',
        city: ''
      },
      name: {
        first: '',
        last: ''
      },
      telephone: {
        countryCode: 0,
        national: 0
      },
      company: {
        name: '',
        position: ''
      }
    }
  };

  // Deep merge function that preserves existing values
  function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (result[key] === null || result[key] === undefined) {
          result[key] = source[key];
        } else if (typeof result[key] === 'object' && !Array.isArray(result[key]) &&
                   typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(result[key], source[key]);
        }
      }
    }

    return result;
  }

  // Start with raw data, then apply defaults
  const account = deepMerge(rawData || {}, defaultSchema);

  // Handle special processing for certain fields

  // Normalize boolean roles (handle string 'true' values)
  if (account.roles) {
    Object.keys(account.roles).forEach(role => {
      account.roles[role] = account.roles[role] === true || account.roles[role] === 'true';
    });
  }

  // Fix timestamp fields to ensure they have both timestamp and timestampUNIX
  function normalizeTimestamps(obj) {
    if (obj && typeof obj === 'object') {
      // Check if this object looks like a timestamp object
      if ('timestamp' in obj || 'timestampUNIX' in obj) {
        // Ensure both fields exist
        if (obj.timestamp === undefined || obj.timestamp === null) {
          obj.timestamp = null;
          obj.timestampUNIX = null;
        } else {
          // If we have a timestamp, ensure we also have timestampUNIX
          const date = new Date(obj.timestamp);
          if (!isNaN(date.getTime())) {
            obj.timestamp = date.toISOString();
            obj.timestampUNIX = Math.round(date.getTime() / 1000);
          } else {
            obj.timestamp = null;
            obj.timestampUNIX = null;
          }
        }
      }

      // Recursively process nested objects
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          normalizeTimestamps(obj[key]);
        }
      });
    }
  }

  normalizeTimestamps(account);

  // Handle subscription access logic
  if (account.subscription) {
    const now = Date.now() / 1000; // Current time in seconds

    // Check if subscription is active
    if (account.subscription.status === 'active' || account.subscription.status === 'trialing') {
      // Check if current period hasn't ended
      if (account.subscription.billing?.currentPeriodEnd?.timestampUNIX) {
        account.subscription.access = account.subscription.billing.currentPeriodEnd.timestampUNIX > now;
      }
    } else {
      account.subscription.access = false;
    }
  }

  // Return the resolved account object
  return account;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = resolveAccount;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return resolveAccount; });
} else if (typeof window !== 'undefined') {
  window.resolveAccount = resolveAccount;
}
