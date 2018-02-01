
/* global module */

(function() {
"use strict";

var Class = function() {};
Class.extend = function(props) {
    props = props || {};
    var _extend = function(dest) { // (Object[, Object, ...]) ->
        var sources = Array.prototype.slice.call(arguments, 1),
            i, j, len, src;
        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j] || {};
            for (i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    };
    var update = function(dst, src) {
        dst = dst || {};
        for (var prop in src) {
            var val = src[prop];
            if (typeof val === "object") { // recursive
                if (typeof dst[prop] !== "object") {
                    dst[prop] = {};
                }
                update(dst[prop], val);
            } else {
                dst[prop] = val;
            }
        }
        return dst; // return dst to allow method chaining
    };
    var parent = this;
    // extended class with the new prototype
    var NewClass = function() {
        // merge options
        this.options = this.options || {};
        //var parentOptions = JSON.parse(JSON.stringify(parent.prototype.options|| {}));
        update(this.options, parent.prototype.options);
        if (props.options) {
          update(this.options, props.options);
        }
        // call the constructor
        if (this.init) {
            this.init.apply(this, arguments);
        }
        // call all constructor hooks
        if (this._initHooks) {
            this.callInitHooks();
        }
    };
    // instantiate class without calling constructor
    var F = function() {};
    F.prototype = this.prototype;
    var proto = new F();
    proto.constructor = NewClass;
    NewClass.prototype = proto;
    //inherit parent's statics
    //update(NewClass.options, this.options);
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype' && i !== "options") {
            NewClass[i] = this[i];
        }
    }
    var events = {
        on: function(type, fn, context) {
            if (!this._events) {
                this._events = {};
            }
            if (!this._events[type]) {
                this._events[type] = [];
            }
            if (context === this) {
                // Less memory footprint.
                context = undefined;
            }
            this._events[type].push({
                cb: fn,
                ctx: context
            });
        },
        emit: function(type, data) {
            if (!this._events[type]) {
                this._events[type] = [];
            }
            var event = Object.assign({}, data, {
                type: type,
                target: this
            });
            if (this._events) {
                var listeners = this._events[type];
                if (listeners) {
                    for (var i = 0, len = listeners.length; i < len; i++) {
                        var l = listeners[i];
                        l.cb.call(l.ctx || this, event);
                    }
                }
            }
            return this;
        },
        once: function(type, fn, context) {
            var self = this;
            var handler = function(event) {
                fn.call(context || this, event);
                self.off(type, this);
            };
            self.on(type, handler, context);
        },
        off: function(type, fn, context) {
            var listeners,
                i,
                len;
                //console.log("off fn ",fn.toString());
            if (!type) {
                // clear all listeners if called without arguments
                delete this._events;
            }
            if (!this._events) {
                return;
            }
            listeners = this._events[type];
            if (!listeners) {
                return;
            }
            if (context === this) {
                context = undefined;
            }
            //console.log("off fn ",fn.toString(),context);
            if (listeners) {
                // find fn and remove it
                for (i = 0, len = listeners.length; i < len; i++) {
                    var l = listeners[i];
                    if (l.ctx !== context) {
                        continue;
                    }
                    if (l.cb === fn) {
                        listeners.splice(i, 1);
                        //return;
                    }
                }
            }
            return this;
        },
        _events: []
    };
    _extend(proto, events);
    // mix given properties into the prototype
    _extend(proto, props);
    proto._initHooks = [];
    // jshint camelcase: false
    NewClass.__super__ = parent.prototype;
    // add method for calling all hooks
    proto.callInitHooks = function() {
        if (this._initHooksCalled) {
            return;
        }
        if (parent.prototype.callInitHooks) {
            parent.prototype.callInitHooks.call(this);
        }
        this._initHooksCalled = true;
        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };
    return NewClass;
};
Class.addInitHook = function(fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);
    var init = typeof fn === 'function' ? fn : function() {
        this[fn].apply(this, args);
    };
    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};
Class.mergeOptions = function(options) {
    Object.assign(this.prototype.options, options);
    return this;
};

module.exports = Class;
}());