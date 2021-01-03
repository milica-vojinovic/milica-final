import {TriggerCallbackOnlyOncePerPeriod} from "./trigger.callback.only.once.per.period.helper";
import {ConstantsService} from "./constants.service";

/*
 *  * Usage & Purpose *
 *
 *  `Util` contains methods which are commonly used but not contained in other services.
 */
export const UtilService = {
    DOM: {
        $createNode: (stringHTML) => {
            let el = document.createElement('div');

            el.innerHTML = stringHTML;

            return el.children[0];
        },
        $appendChild: (parent, child) => {
            if (!parent) return;

            parent.appendChild(child);
        },
        $removeNode: (node) => {
            if (!node) return;

            node.parentNode.removeChild(node);
        },
        $insertBefore: (element, newElement) => {
            if (!element) return;

            element.parentNode.insertBefore(newElement, element);
        },
        $insertAfter: (element, newElement) => {
            if (!element) return;

            element.parentNode.insertBefore(newElement, element.nextSibling);
        },
        $checkExistingClass: (element, className) => {
            if (!element) return;

            return element.classList ?
                element.classList.contains(className) :
                new RegExp('\\b' + className + '\\b').test(element.className);
        },
        $addHTMLClass: (element, className) => {
            if (!element) return;

            const existingClass = UtilService.DOM.$checkExistingClass(element, className);

            if (existingClass) {
                return;
            }
            if (element.classList) {
                element.classList.add(className);
            } else {
                element.className += ' ' + className;
            }
        },
        $deleteHTMLClass: (element, className) => {
            if (!element) return;

            const existingClass = UtilService.DOM.$checkExistingClass(element, className);

            if (!existingClass) {
                return;
            }
            if (element.classList) {
                element.classList.remove(className);
            } else {
                element.className = element.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
            }
        },
        $onResize: (handler) => {
            window.onresize = function () {
                if (handler) handler();
            };
        },
        $onScroll: (handler, target) => {
            target = target ? target : window;

            UtilService.DOM.$on(target, 'scroll', (e) => {
                handler(e);
            });
        },
        $on: (target, event, handler) => {
            if (!target) return;

            if (target.addEventListener) {
                return target.addEventListener(event, handler, false);
            }
            if (target.attachEvent) {
                return target.attachEvent("on" + event, handler);
            }

            return target["on" + event] = handler;
        },
        $off: (target, event, handler) => {
            if (!target) return;

            if (target.addEventListener) {
                return target.removeEventListener(event, handler, false);
            }

            target.detachEvent('on' + event, handler);
        },
        $onPressEnter: (handler, target, throttleTimeout) => {
            function triggerHandler(e) {
                const keycode = (e.keyCode ? e.keyCode : e.which);

                if (keycode === 13) {
                    UtilService.DOM.$off(target, 'keypress', listener);
                    handler(e);
                }
            }

            target = target ? target : document;

            const listener = UtilService.DOM.$on(target, 'keypress', (e) => {
                UtilService.triggerCallbackOnlyOncePerPeriod('enterKeyPress', () => {
                    triggerHandler(e);
                }, throttleTimeout);
            });

            return listener
        },
        $onPageLeave: (callback) => {
            window.onbeforeunload = () => {
                if (callback) callback();
            };
        },
        $getElement: (selector) => {
            let element = false;
            const selectorType = selector[0] === '*' ? 'QUERY' : selector[0] === '#' ? 'ID' : selector[0] === '.' ? 'CLASS' : 'TAG';

            switch (selectorType) {
                case 'ID':
                    selector = selector.replace('#', '');
                    element = document.getElementById(selector);

                    break;
                case 'CLASS':
                    selector = selector.replace('.', '');
                    element = document.getElementsByClassName(selector);

                    break;
                case 'TAG':
                    element = document.getElementsByTagName(selector);

                    break;
                case 'QUERY':
                    selector = selector.substr(1);
                    element = document.querySelectorAll(selector);

                    break;
            }

            return element;
        },
        $getElementStyle: function (element) {
            if (!element) return;

            return window.getComputedStyle ? getComputedStyle(element, null) : element.currentStyle;
        },
        $bindScript: (source, onload) => {
            const tag = document.createElement("script");

            tag.type = "text/javascript";

            if (onload) {
                tag.onload = onload;
            }

            tag.src = source;

            UtilService.DOM.$appendChild(UtilService.DOM.$getElement('head')[0], tag);
        },
        $bindStyleToHead: (css) => {
            const head = document.head || document.getElementsByTagName('head')[0];
            const style = document.createElement('style');

            head.appendChild(style);
            style.type = 'text/css';

            if (style.styleSheet) {
                // This is required for IE8 and below.
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
        },
    },
    extractUrlPath: (path) => {
        const split = path.split('/');

        return split[split.length - 1];
    },
    getCookie: (name) => {
        const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');

        return v ? v[2] : null;
    },
    setCookie: (name, value, days) => {
        const d = new Date;
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
        document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    },
    getClientInfo: () => {
        const isMac = navigator.platform.match(/(Mac)/i);
        const safariVersion = navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
        const isSafari = !!safariVersion;
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        return {
            isMac,
            safariVersion,
            isSafari,
            iOS
        };
    },
    getDeviceType: () => {
        let device = 'Desktop';

        if (window.MD && window.MD.mobile()) {
            if (window.MD.phone()) {
                device = "Phone";
            } else {
                device = "Tablet";
            }
        }

        return device;
    },
    getBrowserName: () => {
        let detectIEregexp;
        let browserName;

        if (window.navigator.userAgent.indexOf('MSIE') != -1) {
            detectIEregexp = /MSIE (\d+\.\d+);/;
        } else {
            detectIEregexp = /Trident.*rv[ :]*(\d+\.\d+)/;
        }
        if (detectIEregexp.test(window.navigator.userAgent)) {
            browserName = 'IE';
        } else {
            if (window.navigator.userAgent.indexOf("Edge") != -1) {
                browserName = 'Edge';
            }
            if ((window.navigator.userAgent.indexOf("Opera") != -1 || window.navigator.userAgent.indexOf('OPR')) != -1) {
                browserName = 'Opera';
            } else if (window.navigator.userAgent.indexOf("Chrome") != -1) {
                browserName = 'Chrome';
            } else if (window.navigator.userAgent.indexOf("Safari") != -1) {
                browserName = 'Safari';
            } else if (window.navigator.userAgent.indexOf("Firefox") != -1) {
                browserName = 'Firefox';
            } else {
                browserName = 'Other';
            }
        }

        return browserName;
    },
    capitalizeFirstLetter: (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    parseURLParamsAsObject: (string) => {
        const url = string ? string.replace('?', '') : window.location.search.replace('?', '');
        const urlParams = url.split('&');
        let params = {};

        urlParams.forEach((param) => {
            const parameterNameValue = param.split('=');

            if (parameterNameValue[0] && parameterNameValue[1]) {
                params[parameterNameValue[0]] = decodeURIComponent(parameterNameValue[1]);
            }
        });

        return params;
    },
    validateEmail: (email) => {
        const trimWhitespaceLowercase = email.replace(/\s+/g, '').toLowerCase();
        const regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (regEx.test(trimWhitespaceLowercase)) {
            return trimWhitespaceLowercase;
        }

        return false;
    },
    validateHex: (hex) => {
        const isValid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);

        return isValid;
    },
    generateRandom: () => {
        return new Date().valueOf() * Math.random();
    },
    replaceAt: (string, index, replacement, cutString) => {
        if (cutString) {
            return string.substr(0, index) + replacement;
        }

        return string.substr(0, index) + replacement + string.substr(index + replacement.length);
    },
    replaceSerbianChars: (string) => {
        if (!string) return '';

        return string.replace(/ć/g, 'c')
            .replace(/č/g, 'c')
            .replace(/đ/g, 'dj')
            .replace(/š/g, 's')
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/ž/g, 'z');
    },
    log: (text, variable, includeTimeStamp, level) => {
        const currentMoment = Date.now();
        const millisecondsDifference = currentMoment - window.vooPlayerLoadedTimeStamp;
        let title = 'Log Written Data';

        if (includeTimeStamp) {
            const minutes = millisecondsDifference / 60000 > 0 ? Math.floor(millisecondsDifference / 60000) : 0;
            const seconds = millisecondsDifference / 1000 > 0 ? Math.floor(millisecondsDifference / 1000) : 0;
            const miliseconds = millisecondsDifference % 1000;

            title = minutes + 'min ' +
                seconds + 'sec ' +
                miliseconds + 'mil';
        }
        // Level sets customized colors of the Log.
        if (!level) {
            // Print TITLE.
            console.log('%c -----!-----!- ' + title + ' -!-----!-----');
            // Print hardcoded TEXT.
            if (text) {
                console.log(text);
            }
            if (variable || variable === false || variable === 0) {
                console.log(variable);
            }
        } else {
            // Print TITLE.
            console.log('%c -----!-----!- ' + title + ' -!-----!-----', 'padding: 2px 7px; background: ' + ConstantsService.DEBUG_LOG_COLORS[level].background + '; color: ' + ConstantsService.DEBUG_LOG_COLORS[level].color + '; font-weight: 900;');
            // Print hardcoded TEXT.
            if (text) {
                console.log('%c ' + text, 'padding: 2px 7px; background: ' + ConstantsService.DEBUG_LOG_COLORS[level].background + '; color: ' + ConstantsService.DEBUG_LOG_COLORS[level].color + '; font-weight: 900;');
            }
            // Print dynamic VARIABLE.
            if (variable || variable === false || variable === 0) {
                console.log('%c ' + variable, 'padding: 2px 7px; background: ' + ConstantsService.DEBUG_LOG_COLORS[level].background + '; color: ' + ConstantsService.DEBUG_LOG_COLORS[level].color);
            }
        }

        if (!variable && variable !== false && variable !== 0) {
            console.log('%c -----!-----!- Variable not provided or is undefined! -!-----!-----', 'padding: 2px 7px; background: ' + ConstantsService.DEBUG_LOG_COLORS[level].background + '; color: #a70b0b; font-weight: 900;');
        }
    },
    truncateString: (string, limit) => {
        if (!string || !limit) return '';
        string = String(string);

        return (string.length > limit) ? string.substr(0, limit - 1) + '...' : string;
    },
    outputOnlyNumbers: (input, warningCallback) => {
        input = String(input);
        let output = '';
        let numbers = '.0123456789';

        for (let i = 0; i < input.length; i++) {
            if (input[i] === ',') {
                output = output + '.';

                return;
            }
            if (numbers.indexOf(input[i]) > -1) {
                output = output + input[i];
            } else if (warningCallback) {
                warningCallback();
            }
        }

        return output;
    },
    triggerCallbackOnlyOncePerPeriod: (callbackKey, callback, period) => {
        return TriggerCallbackOnlyOncePerPeriod(callbackKey, callback, period, UtilService);
    },
    isNumber: (n) => {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    isString: (s) => {
        return typeof s === 'string';
    },
    loopThroughItems: (items, callback) => {
        for (let itemKey in items) {
            callback(items[itemKey], itemKey)
        }
    },
    clone: (obj) => {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            let clonedArr = [];
            obj.forEach(function (element) {
                clonedArr.push(UtilService.clone(element))
            });
            return clonedArr;
        }
        let clonedObj = new obj.constructor();

        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                clonedObj[prop] = UtilService.clone(obj[prop]);
            }
        }

        return clonedObj;
    },
    extractExtensionFromUrl: (url) => {
        if (!url) return 'N/A';

        return url.split('.').pop();
    },
    extractNameFromUrl: (url) => {
        let parts = [];
        if (!url) return 'N/A';

        if (url.indexOf('\\') >= 0) {
            parts = url.split("\\");
        } else if (url.indexOf('/') >= 0) {
            parts = url.split("/");
        }

        return parts.pop();
    },
	compareObjects : (object1, object2) => {
		if (Object.keys(object1).length !== Object.keys(object2).length)
			return false;
		for (const key in object1) {
			if (typeof object1[key] === 'object') {
				if (UtilService.compareObjects(object1[key], object2[key]) === false) {
					return false;
				}
			} else {
				if (object1[key] !== object2[key]) {
					return false;
				}
			}
		}
		return true;
	},
};
