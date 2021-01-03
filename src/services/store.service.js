// Internal dependencies
import {UtilService} from './util.service';
import {ConstantsService} from "./constants.service";

const localStorageKey = ConstantsService.LOCAL_STORAGE_KEY;
const localStorageAPI = {
    update: (data) => {
        if (localStorage) {
            const localStorageData = data ? UtilService.clone(data) : {};

            localStorage.setItem(localStorageKey, JSON.stringify(localStorageData));

            return true;
        }

        return false;
    },
    get: () => {
        const data = localStorage.getItem(localStorageKey);

        return JSON.parse(data);
    }
};

let cachedData = {};

export const StoreService = {
    initialize: () => {
        let storage = localStorageAPI.get();

        if (storage) {
            cachedData = storage;
        } else {
            cachedData = StoreService.getEmptyData();
        }

        localStorageAPI.update(cachedData);

        StoreService.hooks = {};
    },
    getEmptyData: () => {
        return {
            user: {}
        };
    },
    getStoreData: () => {
        return UtilService.clone(cachedData);
    },
    getStoreProperty: (property) => {
        const currentStore = UtilService.clone(cachedData);

        if (!property) return null;

        return currentStore[property];
    },
    updateStoreData: (data) => {
        cachedData = data;

        localStorageAPI.update(cachedData);

        const clonedData = StoreService.getStoreData();

        UtilService.loopThroughItems(StoreService.hooks, (hookCallback) => {
            hookCallback(clonedData);
        });
    },
    updateStoreProperty: (property, value) => {
        if (!property) return null;

        cachedData[property] = value;

        localStorageAPI.update(cachedData);

        const clonedData = StoreService.getStoreData();

        UtilService.loopThroughItems(StoreService.hooks, (hookCallback) => {
            hookCallback(UtilService.clone(clonedData));
        });
    },
    clearStoreData: () => {
        let emptyData = StoreService.getEmptyData();

        cachedData = emptyData;

        localStorageAPI.update(cachedData);
    },
    hookOnStoreUpdate: (hookName, hookCallback) => {
        StoreService.hooks[hookName] = hookCallback;
    },
    deleteHookOnStoreUpdate: (hookName) => {
        delete StoreService.hooks[hookName];
    }
};
