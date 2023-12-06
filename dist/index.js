(function (root, factory) {
  // https://github.com/umdjs/umd/blob/master/templates/returnExports.js
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  var environment = (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') ? 'node' : 'browser';

  var SOURCE = 'library';
  var VERSION = '1.0.10';

  function ResolveAccount(options) {
    var self = this

    options = options || {};

    self.Manager = options.Manager;
    self.utilities = options.utilities;
    self.dom = options.dom;

    self.properties = {};

    return self;
  };

  ResolveAccount.prototype.resolve = function (firebaseUser, account, options) {
    var self = this;

    firebaseUser = firebaseUser || {};
    account = account || {};
    options = options || {};

    var defaultPlanId = options.defaultPlanId || 'basic';

    var currentURL;
    var isDevelopment;

    // Resolve auth
    account.auth = account.auth || {};
    account.auth.uid = account.auth.uid || firebaseUser.uid || null;
    account.auth.email = account.auth.email || firebaseUser.email || null;
    account.auth.temporary = account.auth.temporary || false;

    // Resolve plan
    account.plan = account.plan || {};
    account.plan.id = account.plan.id || defaultPlanId;

    account.plan.status = account.plan.status || 'cancelled';

    account.plan.expires = account.plan.expires || {};
    account.plan.expires.timestamp = new Date(account.plan.expires.timestamp || 0).toISOString();
    account.plan.expires.timestampUNIX = Math.round(new Date(account.plan.expires.timestamp || 0).getTime() / 1000);

    account.plan.trial = account.plan.trial || {};
    account.plan.trial.activated = account.plan.trial.activated || false;
    account.plan.trial.expires = account.plan.trial.expires || {};
    account.plan.trial.expires.timestamp = new Date(account.plan.trial.expires.timestamp || 0).toISOString()
    account.plan.trial.expires.timestampUNIX = Math.round(new Date(account.plan.trial.expires.timestamp || 0).getTime() / 1000);

    account.plan.limits = account.plan.limits || {};
    // account.plan.devices = account.plan.devices || 1;

    account.plan.payment = account.plan.payment || {};
    account.plan.payment.processor = account.plan.payment.processor || 'unknown';
    account.plan.payment.orderId = account.plan.payment.orderId || 'unknown';
    account.plan.payment.resourceId = account.plan.payment.resourceId || 'unknown';
    account.plan.payment.frequency = account.plan.payment.frequency || 'unknown';
    account.plan.payment.active = account.plan.payment.active || false;

    account.plan.payment.startDate = account.plan.payment.startDate || {};
    account.plan.payment.startDate.timestamp = account.plan.payment.startDate.timestamp || '1970-01-01T00:00:00.000Z';
    account.plan.payment.startDate.timestampUNIX = account.plan.payment.startDate.timestampUNIX || 0;

    account.plan.payment.updatedBy = account.plan.payment.updatedBy || {};
    account.plan.payment.updatedBy.event = account.plan.payment.updatedBy.event || {};
    account.plan.payment.updatedBy.event.id = account.plan.payment.updatedBy.event.id || 'unknown';
    account.plan.payment.updatedBy.event.name = account.plan.payment.updatedBy.event.name || 'unknown';
    account.plan.payment.updatedBy.date = account.plan.payment.updatedBy.date || {};
    account.plan.payment.updatedBy.date.timestamp = account.plan.payment.updatedBy.date.timestamp || '1970-01-01T00:00:00.000Z';
    account.plan.payment.updatedBy.date.timestampUNIX = account.plan.payment.updatedBy.date.timestampUNIX || 0;

    // Set some variables
    // In a try/catch because this lib is used in node sometimes
    try {
      currentURL = new URL(window.location.href);
      isDevelopment = self.utilities.get(self.Manager, 'properties.meta.environment', '') === 'development';

      if (isDevelopment) {
        currentURL.searchParams
        .forEach(function(value, key) {
          var accountValue = self.utilities.get(account, key, undefined)
          if (typeof accountValue !== 'undefined') {
            if (value === 'true') { value = true }
            if (value === 'false') { value = false }

            self.utilities.set(account, key, value)
          }
        });
      }
    } catch (e) {
      if (typeof window !== 'undefined') {
        console.error('Unable to check query strings', e);
      }
    }

    var now = new Date();
    var planExpireDate = new Date(account.plan.expires.timestamp);
    var daysTillExpire = Math.floor((planExpireDate - now) / 86400000);
    var difference = (planExpireDate.getTime() - now.getTime()) / (24 * 3600 * 1000);
    var trialExpireDate = new Date(account.plan.trial.expires.timestamp);
    var daysTillTrialExpire = Math.floor((trialExpireDate - now) / 86400000);
    var startDate = new Date(account.plan.payment.startDate.timestamp);
    var planIsActive = difference > -1 && account.plan.id !== defaultPlanId;
    var planIsSuspended = account.plan.status === 'suspended';

    if (planIsActive) {
      account.plan.id = account.plan.id;
    } else {
      account.plan.id = defaultPlanId;
    }

    // Resolve oAuth2
    account.oauth2 = account.oauth2 || {};
    // account.oauth2.discord = account.oauth2.discord || {};
    // account.oauth2.discord.user = account.oauth2.discord.user || {};

    // Resolve roles
    account.roles = account.roles || {};
    // account.roles.betaTester = account.plan.id === defaultPlanId ? false : account.roles.betaTester === true || account.roles.betaTester === 'true';
    account.roles.betaTester = account.roles.betaTester === true || account.roles.betaTester === 'true';
    account.roles.developer = account.roles.developer === true || account.roles.developer === 'true';
    account.roles.admin = account.roles.admin === true || account.roles.admin === 'true';
    account.roles.vip = account.roles.vip === true || account.roles.vip === 'true';
    account.roles.og = account.roles.og === true || account.roles.og === 'true';
    account.roles.promoExempt = account.roles.promoExempt === true || account.roles.promoExempt === 'true';

    // Resolve affiliate
    account.affiliate = account.affiliate || {};
    account.affiliate.code = account.affiliate.code || 'unknown';
    account.affiliate.referrals = account.affiliate.referrals || [];
    account.affiliate.referrer = account.affiliate.referrer || 'unknown';

    // Resolve activity
    account.activity = account.activity || {};
    account.activity.lastActivity = account.activity.lastActivity || {};
    account.activity.lastActivity.timestamp = account.activity.lastActivity.timestamp || '1970-01-01T00:00:00.000Z';
    account.activity.lastActivity.timestampUNIX = account.activity.lastActivity.timestampUNIX || 0;

    account.activity.created = account.activity.created || {};
    account.activity.created.timestamp = account.activity.created.timestamp || '1970-01-01T00:00:00.000Z';
    account.activity.created.timestampUNIX = account.activity.created.timestampUNIX || 0;

    account.activity.geolocation = account.activity.geolocation || {};
    account.activity.geolocation.ip = account.activity.geolocation.ip || 'unknown';
    account.activity.geolocation.continent = account.activity.geolocation.continent || 'unknown';
    account.activity.geolocation.country = account.activity.geolocation.country || 'unknown';
    account.activity.geolocation.region = account.activity.geolocation.region || 'unknown';
    account.activity.geolocation.city = account.activity.geolocation.city || 'unknown';
    account.activity.geolocation.latitude = account.activity.geolocation.latitude || 0;
    account.activity.geolocation.longitude = account.activity.geolocation.longitude || 0;

    account.activity.client = account.activity.client || {};
    account.activity.client.userAgent = account.activity.client.userAgent || 'unknown';
    account.activity.client.language = account.activity.client.language || 'unknown';
    account.activity.client.platform = account.activity.client.platform || 'unknown';
    account.activity.client.mobile = account.activity.client.mobile || null;

    // Api
    account.api = account.api || {};
    account.api.clientId = account.api.clientId || 'unknown';
    account.api.privateKey = account.api.privateKey || 'unknown';

    // Usage
    account.usage = account.usage || {};

    account.usage.requests = account.usage.requests || {};
    account.usage.requests.total = account.usage.requests.total || 0;
    account.usage.requests.period = account.usage.requests.period || 0;

    account.usage.requests.last = account.usage.requests.last || {};
    account.usage.requests.last.id = account.usage.requests.last.id || '';
    account.usage.requests.last.timestamp = account.usage.requests.last.timestamp || '1970-01-01T00:00:00.000Z';
    account.usage.requests.last.timestampUNIX = account.usage.requests.last.timestampUNIX || 0;

    // Personal
    account.personal = account.personal || {};

    account.personal.birthday = account.personal.birthday || {};
    account.personal.birthday.timestamp = account.personal.birthday.timestamp || '1970-01-01T00:00:00.000Z';
    account.personal.birthday.timestampUNIX = account.personal.birthday.timestampUNIX || 0;

    account.personal.gender = account.personal.gender || '';

    account.personal.location = account.personal.location || {};
    account.personal.location.city = account.personal.location.city || '';
    account.personal.location.country = account.personal.location.country || '';

    account.personal.name = account.personal.name || {};
    account.personal.name.first = account.personal.name.first || '';
    account.personal.name.last = account.personal.name.last || '';

    account.personal.telephone = account.personal.telephone || {};
    account.personal.telephone.countryCode = account.personal.telephone.countryCode || 0;
    account.personal.telephone.national = account.personal.telephone.national || 0;

    // Set UI elements
    // In a try/catch because this lib is used in node sometimes
    try {
      var cancelURL = isDevelopment ? 'http://localhost:4001/cancel' : 'https://itwcreativeworks.com/portal/account/manage';

      var billingSubscribeBtn = self.dom.select('.auth-billing-subscribe-btn');
      var billingUpdateBtn = self.dom.select('.auth-billing-update-btn');
      var billingPlanId = self.dom.select('.auth-billing-plan-id-element');
      var billingFrequencyEl = self.dom.select('.auth-billing-frequency-element');
      var billingStartDateEl = self.dom.select('.auth-billing-start-date-element');
      var billingExpirationDateEl = self.dom.select('.auth-billing-expiration-date-element');
      var billingSuspendedMessageEl = self.dom.select('.auth-billing-suspended-message-element');
      var billingTrialExpirationDateEl = self.dom.select('.auth-billing-trial-expiration-date-element');

      var $referralCount = self.dom.select('.auth-referral-count-element');
      var $referralCode = self.dom.select('.auth-referral-code-element');
      var $referralLink = self.dom.select('.auth-referral-link-element');
      var $referralSocialLink = self.dom.select('a.auth-referral-social-link[data-provider]');

      var authCreatedEl = self.dom.select('.auth-created-element');
      var authPhoneInput = self.dom.select('.auth-phone-input');

      var updateURL = new URL(cancelURL);
      var referralURL = new URL(window.location.origin || window.location.host);

      function _setAuthItem(selector, value) {
        self.dom.select(selector).each(function(e, i) {
          if (e.tagName === 'INPUT') {
            self.dom.select(e).setValue(value);
          } else {
            self.dom.select(e).setInnerHTML(value);
          }
        });
      }

      referralURL.pathname = '/';
      referralURL.searchParams.set('aff', account.affiliate.code)

      authCreatedEl.setInnerHTML(
        new Date(+self.utilities.get(firebaseUser, 'metadata.createdAt', '0'))
        .toLocaleString(undefined, {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
      )
      authPhoneInput.setInnerHTML(firebaseUser.phoneNumber).setValue(firebaseUser.phoneNumber)

      updateURL.searchParams.set('orderId', account.plan.payment.orderId);
      updateURL.searchParams.set('resourceId', account.plan.payment.resourceId);

      billingUpdateBtn.setAttribute('hidden', true).setAttribute('href', updateURL.toString());
      billingSubscribeBtn.setAttribute('hidden', true);
      billingSuspendedMessageEl.setAttribute('hidden');
      billingTrialExpirationDateEl.setAttribute('hidden');

      // Update active UI
      if (planIsActive) {
        billingUpdateBtn.removeAttribute('hidden');
      } else {
        billingSubscribeBtn.removeAttribute('hidden');
      }

      // Update suspended UI
      if (planIsSuspended) {
        billingUpdateBtn.removeAttribute('hidden');
        billingSubscribeBtn.setAttribute('hidden', true);

        billingSuspendedMessageEl.removeAttribute('hidden');
      }

      // Update trial UI
      if (
        account.plan.trial.activated
        && daysTillTrialExpire > 0
      ) {
        billingTrialExpirationDateEl
        .removeAttribute('hidden')
        .setInnerHTML('<i class="fas fa-gift mr-1"></i> Your free trial expires in ' + daysTillTrialExpire + ' days');
      }

      // Update billing UI
      billingPlanId.setInnerHTML(splitDashesAndUppercase(account.plan.id));
      billingFrequencyEl.setInnerHTML(account.plan.id !== defaultPlanId ? ' (billed ' + uppercase(account.plan.payment.frequency) + ')' : '');
      billingStartDateEl.setInnerHTML(account.plan.id !== defaultPlanId ? ' - Purchased ' + getMonth(startDate) + ' ' + startDate.getDate() + ', ' + startDate.getFullYear() : '');
      billingExpirationDateEl.setInnerHTML(account.plan.id !== defaultPlanId && daysTillExpire < 366
        ? '<i class="fas fa-exclamation-triangle mr-1"></i> Expires in ' + daysTillExpire + ' days '
        : '');

      _setAuthItem('.auth-apikey-element', self.utilities.get(account, 'api.privateKey', 'n/a'));

      $referralCount.setInnerHTML(account.affiliate.referrals.length);
      $referralCode.setInnerHTML(account.affiliate.code).setValue(account.affiliate.code);
      $referralCode.setInnerHTML(referralURL.toString()).setValue(referralURL.toString());

      var affiliateLinkURI = encodeURIComponent(referralURL.toString());
      var affiliateLinkTextURI = encodeURIComponent('Sign up for ' + self.utilities.get(self.Manager, 'properties.global.brand.name', 'this') + ', a useful service:');

      $referralSocialLink
      .each(function ($el) {
        var provider = $el.dataset.provider;
        var text = encodeURIComponent($el.dataset.shareText || '');

        $el.setAttribute('target', '_blank')

        if (provider === 'facebook') {
          $el.setAttribute('href', 'https://www.facebook.com/sharer.php?u=' + (affiliateLinkURI) + '')
        } else if (provider === 'twitter') {
          $el.setAttribute('href', 'https://twitter.com/share?url=' + (affiliateLinkURI) + '&text=' + (text || affiliateLinkTextURI) + '')
        } else if (provider === 'pinterest') {
          $el.setAttribute('href', 'https://pinterest.com/pin/create/button/?url=' + (affiliateLinkURI) + '&description=' + (text || affiliateLinkTextURI) + '')
        } else if (provider === 'tumblr') {
          $el.setAttribute('href', 'https://www.tumblr.com/share/link?url=' + (affiliateLinkURI) + '&text=' + (text || affiliateLinkTextURI) + '')
        } else if (provider === 'linkedin') {
          $el.setAttribute('href', 'https://www.linkedin.com/sharing/share-offsite/?url=' + (affiliateLinkURI) + '&title=' + (text || affiliateLinkTextURI) + '')
          // $el.setAttribute('href', `http://www.linkedin.com/shareArticle?mini=true&url=https://stackoverflow.com/questions/10713542/how-to-make-custom-linkedin-share-button/10737122&title=How%20to%20make%20custom%20linkedin%20share%20button&summary=some%20summary%20if%20you%20want&source=stackoverflow.com`)
          // $el.setAttribute('href', `http://www.linkedin.com/shareArticle?mini=false&url=' + affiliateLinkURI + '&title=' + text || affiliateLinkTextURI + '`)
        } else if (provider === 'reddit') {
          $el.setAttribute('href', 'http://www.reddit.com/submit?url=' + (affiliateLinkURI) + '&title=' + (text || affiliateLinkTextURI) + '')
        }
      })

    } catch (e) {
      if (typeof window !== 'undefined') {
        console.error('Unable to set DOM elements', e);
      }
    }

    self.properties = account;

    return self.properties;
  }


  // Register
  if (environment === 'browser') {
    try {
      window.ResolveAccount = ResolveAccount;
    } catch (e) {
    }
  }

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return ResolveAccount; // Enable if using UMD

}));
