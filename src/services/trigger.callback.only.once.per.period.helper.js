let callbacksTriggerMap = {};

export const TriggerCallbackOnlyOncePerPeriod = (callbackKey, callback, period, Util) => {
    return new Promise((resolve) => {
        function interval(callbackObject) {
            //UtilService.log('TRIGGER CALLBACK', callbackObject.interval);
            clearInterval(callbackObject.interval);

            callbackObject.callback();
            /*callbackObject.callback().then((response) => {
                //UtilService.log('CALLBACK RESPONSE', callbackKey);
                resolve(response);
            });*/
        }

        if (callbacksTriggerMap[callbackKey]) {
            clearInterval(callbacksTriggerMap[callbackKey].interval);
        }

        callbacksTriggerMap[callbackKey] = {
            duration: period,
            interval: setInterval(() => {
                interval(callbacksTriggerMap[callbackKey]);
            }, period),
            callback: callback
        };
    });
};