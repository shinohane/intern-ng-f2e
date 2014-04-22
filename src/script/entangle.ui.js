/**
 * Entangle - UI Toolkit
 */

entangle.extend({

  /**
   * @name location
   * @desc window.location object
   */
  location: function () { // {{{

    var converter = function () {
      this.resolve(location);
    };

    // get location from window object
    var location = {
      host: window.location.host,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      search: window.location.search,
      href: window.location.href,
      port: window.location.port,
      pathname: window.location.pathname,
      hash: window.location.hash,
    };

    var context = this.contextof(converter);

    // listen for hash change event
    $(window).on('hashchange', function () {
      location.hash = window.location.hash;
      context.resolve(location);
    });

    return converter;

  }, // }}} location

  /**
   * @name qs
   * @desc parse querystring to object
   */
  qs: function () { // {{{
    return function (search) {
      this.resolve($.parseParams(search));
    };
  }, // }}} qs

  /**
   * @name invoke
   * @desc apply a set of function calls to object with value(s) from pipe
   */
  invoke: function (object, call) { // {{{
    var _call = _.transform(call, function (r, v, k) {
      r[k] = (typeid(v) == 'array') ? v : [v];
    });
    return function (___) {
      _.each(_call, function (v, k) {
        if (_.any(v, function (name) { return !___.hasOwnProperty(name); })) {
          return;
        }
        fapply(object[k], object, _.map(v, function (name) {
          return ___[name];
        }));
      });
    };
  }, // }}} invoke

  /**
   * @name join
   * @desc join list of values to string
   * @param delimiter
   */
  join: function (delimiter) {
    return function (___) {
      this.resolve(_.flatten(___).join(delimiter));
    };
  },

  /**
   * @name classname
   * @desc transform list of classname to classname string
   */
  classname: function () {
    return entangle.join(' ');
  },

  /**
   * @name radio
   * @desc resolves radio selection (`on`/`off` set)
   * @param universe {array} - all states
   * @param selector {converter} - figure out `on` set
   */
  radio: function (universe, selector) { // {{{
    return entangle()
    .fork({
      _states: entangle.data(universe),
      current: selector
    })
    .sponge()
    .fork({
      on: entangle().pick('current'),
      off: entangle().pick('_states', 'current').difference()
    });
  }, // }}}

  /**
   * @name class
   * @desc add `on` classes and removes `off` classes
   */
  class$: function (selector) { // {{{
    return entangle()
    .hash(entangle.classname)
    .sponge()
    .invoke$(selector, {
      addClass: 'on', removeClass: 'off'
    });
  }, // }}}

});

// Make jQuery shortcuts {{{

_.each([ 'invoke' ], function (name) {
  entangle.extend(pair(name + '$', function () {
    var args = array(arguments);
    var selector = args.shift();
    return entangle[name].apply(null, [ $(selector) ].concat(args));
  }));
});

// }}}

