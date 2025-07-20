"use client";

import { useSyncExternalStore } from "react";

type SetStoreInternal<T> = (
  partial: T | Partial<T> | ((store: T) => T | Partial<T>),
  replace?: boolean,
) => void;

type Get<T, K, F> = K extends keyof T ? T[K] : F;
type Write<T, U> = Omit<T, keyof U> & U;
type SkipTwo<T> = T extends { length: 0 }
  ? []
  : T extends { length: 1 }
  ? []
  : T extends { length: 0 | 1 }
  ? []
  : T extends [unknown, unknown, ...infer A]
  ? A
  : T extends [unknown, unknown?, ...infer A]
  ? A
  : T extends [unknown?, unknown?, ...infer A]
  ? A
  : never;
type SetStoreType<T extends unknown[]> = Exclude<T[0], (...args: any[]) => any>;

type WithImmer<S> = Write<S, StoreImmer<S>>;
type StoreImmer<S> = S extends { setStore: infer SetStore }
  ? SetStore extends {
    (...args: infer A1): infer Sr1;
    (...args: infer A2): infer Sr2;
  }
  ? {
    setStore(
      nextStoreOrUpdater:
        | SetStoreType<A2>
        | Partial<SetStoreType<A2>>
        | ((store: SetStoreType<A2>) => void),
      shouldReplace?: false,
      ...args: SkipTwo<A1>
    ): Sr1;
    setStore(
      nextStoreOrUpdater:
        | SetStoreType<A2>
        | ((store: SetStoreType<A2>) => void),
      shouldReplace: true,
      ...args: SkipTwo<A2>
    ): Sr2;
  }
  : never
  : never;

type WithPersist<S, A> = S extends { getStore: () => infer T }
  ? Write<S, StorePersist<T, A>>
  : never;
type PersistListener<S> = (store: S) => void;
type StorePersist<S, Ps> = {
  persist: {
    setOptions: (options: Partial<PersistOptions<S, Ps>>) => void;
    clearStorage: () => void;
    rehydrate: () => Promise<void> | void;
    hasHydrated: () => boolean;
    onHydrate: (fn: PersistListener<S>) => () => void;
    onFinishHydration: (fn: PersistListener<S>) => () => void;
    getOptions: () => Partial<PersistOptions<S, Ps>>;
  };
};

type ReducerAction = { type: string };
type StoreWithReducer<A> = { dispatch: (a: A) => A };
type WithReducer<S, A> = Write<S, StoreWithReducer<A>>;

type WithSelectorSubscribe<S> = S extends { getStore: () => infer T }
  ? Write<S, StateSubscribeWithSelector<T>>
  : never;
type StateSubscribeWithSelector<T> = {
  subscribe: {
    (listener: (selectedStore: T, previousSelectedStore: T) => void): () => void;
    <U>(
      selector: (store: T) => U,
      listener: (selectedStore: U, previousSelectedStore: U) => void,
      options?: {
        equalityFn?: (a: U, b: U) => boolean;
        fireImmediately?: boolean;
      },
    ): () => void;
  };
};

export interface StoreMutators<S, A> {
  ["store/immer"]?: WithImmer<S>;
  ["store/persist"]?: WithPersist<S, A>;
  ["store/reducer"]?: WithReducer<S, A>;
  ["store/subscribeWithSelector"]?: WithSelectorSubscribe<S>;
}

export interface StoreApi<T> {
  setStore: SetStoreInternal<T>;
  getStore: () => T;
  getInitialStore: () => T;
  subscribe: (listener: (store: T, prevStore: T) => void) => () => void;
}

type ReadonlyStoreApi<T> = Pick<
  StoreApi<T>,
  "getStore" | "getInitialStore" | "subscribe"
>;

export type ExtractStore<S> = S extends { getStore: () => infer T } ? T : never;
export type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;

export type Mutate<S, Ms> = number extends Ms["length" & keyof Ms]
  ? S
  : Ms extends []
  ? S
  : Ms extends [[infer Mi, infer Ma], ...infer Mrs]
  ? Mutate<NonNullable<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier]>, Mrs>
  : never;

export type StoreInitializer<
  T extends object,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
> = ((
  setStore: Get<Mutate<StoreApi<T>, Mis>, "setStore", never>,
  getStore: Get<Mutate<StoreApi<T>, Mis>, "getStore", never>,
  store: Mutate<StoreApi<T>, Mis>,
) => U) & { $$storeMutators?: Mos };

type CreateStoreFn = {
  <T extends object, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StoreInitializer<T, [], Mos>,
  ): Mutate<StoreApi<T>, Mos>;
  <T extends object>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StoreInitializer<T, [], Mos>,
  ) => Mutate<StoreApi<T>, Mos>;
};

type CreateStoreImpl = <
  T extends object,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StoreInitializer<T, [], Mos>,
) => Mutate<StoreApi<T>, Mos>;

const createStoreImpl: CreateStoreImpl = (createStoreFn) => {
  type TStore = ReturnType<typeof createStoreFn>;
  type Listener = (store: TStore, prevStore: TStore) => void;

  let store: TStore;
  const listeners: Set<Listener> = new Set();

  const setStore: StoreApi<TStore>["setStore"] = (partial, replace) => {
    const nextStore =
      typeof partial === "function"
        ? (partial as (store: TStore) => TStore)(store)
        : partial;

    if (!Object.is(nextStore, store)) {
      const previousStore = store;
      store =
        replace ?? (typeof nextStore !== "object" || nextStore === null)
          ? (nextStore as TStore)
          : Object.assign({}, store, nextStore);
      listeners.forEach((listener) => listener(store, previousStore));
    }
  };

  const getStore: StoreApi<TStore>["getStore"] = () => store;
  const getInitialStore: StoreApi<TStore>["getInitialStore"] = () => initialStore;
  const subscribe: StoreApi<TStore>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { setStore, getStore, getInitialStore, subscribe };
  const initialStore = (store = createStoreFn(setStore, getStore, api));

  return api as any;
};

export const createStore = ((createStoreFn) =>
  createStoreFn
    ? createStoreImpl(createStoreFn)
    : createStoreImpl) as CreateStoreFn;

const identity = <T>(arg: T): T => arg;

export function useStore<S extends ReadonlyStoreApi<unknown>>(
  api: S,
): ExtractStore<S>;
export function useStore<S extends ReadonlyStoreApi<unknown>, U>(
  api: S,
  selector: (store: ExtractStore<S>) => U,
  equalityFn?: (a: U, b: U) => boolean,
): U;
export function useStore<TStore, StoreSlice>(
  api: ReadonlyStoreApi<TStore>,
  selector: (store: TStore) => StoreSlice = identity as any,
  equalityFn: (a: StoreSlice, b: StoreSlice) => boolean = Object.is,
) {
  const getSnapshot = () => selector(api.getStore());

  const subscribe = (onStoreChange: () => void) => {
    const unsubscribe = api.subscribe((store, prevStore) => {
      if (!equalityFn(selector(store), selector(prevStore))) {
        onStoreChange();
      }
    });
    return unsubscribe;
  };

  const getServerSnapshot = () => selector(api.getInitialStore());

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractStore<S>;
  <U>(
    selector: (store: ExtractStore<S>) => U,
    equalityFn?: (a: U, b: U) => boolean,
  ): U;
} & S;

type Create = {
  <T extends object, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StoreInitializer<T, [], Mos>,
  ): UseBoundStore<Mutate<StoreApi<T>, Mos>>;
  <T extends object>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StoreInitializer<T, [], Mos>,
  ) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

const createImplReact = <
  T extends object,
  Mos extends [StoreMutatorIdentifier, unknown][],
>(
  createStoreFn: StoreInitializer<T, [], Mos>,
) => {
  const api = createStore(createStoreFn);
  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};

export const create = (<T extends object>(
  createStoreFn: StoreInitializer<T, [], any> | undefined,
) =>
  createStoreFn
    ? createImplReact(createStoreFn)
    : <Mos extends [StoreMutatorIdentifier, unknown][]>(
      initializer: StoreInitializer<T, [], Mos>,
    ) => createImplReact(initializer)) as Create;

const isIterable = (obj: object): obj is Iterable<unknown> =>
  Symbol.iterator in obj;

const hasIterableEntries = (
  value: Iterable<unknown>,
): value is Iterable<unknown> & { entries(): Iterable<[unknown, unknown]> } =>
  "entries" in value;

const compareEntries = (
  valueA: { entries(): Iterable<[unknown, unknown]> },
  valueB: { entries(): Iterable<[unknown, unknown]> },
) => {
  const mapA = valueA instanceof Map ? valueA : new Map(valueA.entries());
  const mapB = valueB instanceof Map ? valueB : new Map(valueB.entries());

  if (mapA.size !== mapB.size) return false;

  let isEqual = true;
  mapA.forEach((value, key) => {
    if (!isEqual || !Object.is(value, mapB.get(key))) {
      isEqual = false;
    }
  });

  return isEqual;
};

const compareIterables = (
  valueA: Iterable<unknown>,
  valueB: Iterable<unknown>,
) => {
  const iteratorA = valueA[Symbol.iterator]();
  const iteratorB = valueB[Symbol.iterator]();
  let nextA = iteratorA.next();
  let nextB = iteratorB.next();

  while (!nextA.done && !nextB.done) {
    if (!Object.is(nextA.value, nextB.value)) return false;
    nextA = iteratorA.next();
    nextB = iteratorB.next();
  }

  return !!nextA.done && !!nextB.done;
};

export function shallow<T>(valueA: T, valueB: T): boolean {
  if (Object.is(valueA, valueB)) return true;

  if (
    typeof valueA !== "object" ||
    valueA === null ||
    typeof valueB !== "object" ||
    valueB === null
  ) {
    return false;
  }

  if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) {
    return false;
  }

  if (isIterable(valueA) && isIterable(valueB)) {
    if (hasIterableEntries(valueA) && hasIterableEntries(valueB)) {
      return compareEntries(valueA, valueB);
    }
    return compareIterables(valueA, valueB);
  }

  return compareEntries(
    { entries: () => Object.entries(valueA) },
    { entries: () => Object.entries(valueB) },
  );
}

export function combine<
  T extends object,
  U extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initialStore: T,
  create: StoreInitializer<T, Mps, Mcs, U>,
): StoreInitializer<Write<T, U>, Mps, Mcs> {
  return (...args) =>
    Object.assign({}, initialStore, (create as any)(...args));
}

type ImmerImpl = <T extends object>(
  storeInitializer: StoreInitializer<T, [], []>,
) => StoreInitializer<T, [], []>;

const immerImpl: ImmerImpl = (initializer) => (setStore, getStore, store) => {
  type T = ReturnType<typeof initializer>;

  store.setStore = (updater, replace, ...args) => {
    const updatedStore = (
      currentStore: T,
    ): T | Partial<T> => {
      if (typeof updater === "function") {
        const draft = { ...currentStore };
        const result = (updater as (store: T) => void | T)(draft);

        if (result !== undefined) {
          return result;
        }
        return draft;
      }
      return updater;
    };

    return setStore(updatedStore, replace as any, ...args);
  };

  return initializer(store.setStore, getStore, store);
};

export type Immer = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StoreInitializer<T, [...Mps, ["store/immer", never]], Mcs>,
) => StoreInitializer<T, Mps, [["store/immer", never], ...Mcs]>;

export const immer = immerImpl as unknown as Immer;

export interface StorageEngine {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
}

export type StorageValue<S> = { store: S; version?: number };

export interface PersistStorage<S> {
  getItem: (
    name: string,
  ) => StorageValue<S> | null | Promise<StorageValue<S> | null>;
  setItem: (name: string, value: StorageValue<S>) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
}

type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown;
  replacer?: (key: string, value: unknown) => unknown;
};

export function createJSONStorage<S>(
  getStorage: () => StorageEngine,
  options?: JsonStorageOptions,
): PersistStorage<S> | undefined {
  let storage: StorageEngine | undefined;
  try {
    storage = getStorage();
  } catch {
    return;
  }

  const persistStorage: PersistStorage<S> = {
    getItem: (name) => {
      const parse = (str: string | null) =>
        str === null
          ? null
          : (JSON.parse(str, options?.reviver) as StorageValue<S>);
      const str = storage!.getItem(name) ?? null;
      if (str instanceof Promise) return str.then(parse);
      return parse(str);
    },
    setItem: (name, newValue) =>
      storage!.setItem(name, JSON.stringify(newValue, options?.replacer)),
    removeItem: (name) => storage!.removeItem(name),
  };
  return persistStorage;
}

export interface PersistOptions<S, PersistedStore = S> {
  name: string;
  storage?: PersistStorage<PersistedStore> | undefined;
  partialize?: (store: S) => PersistedStore;
  onRehydrateStorage?: (
    store: S,
  ) => ((store?: S, error?: unknown) => void) | void;
  version?: number;
  migrate?: (
    persistedStore: unknown,
    version: number,
  ) => PersistedStore | Promise<PersistedStore>;
  merge?: (persistedStore: unknown, currentStore: S) => S;
  skipHydration?: boolean;
}

type Thenable<Value> = {
  then<V>(
    onFulfilled: (value: Value) => V | Promise<V> | Thenable<V>,
  ): Thenable<V>;
  catch<V>(
    onRejected: (reason: Error) => V | Promise<V> | Thenable<V>,
  ): Thenable<V>;
};

const toThenable = <Result, Input>(
  fn: (input: Input) => Result | Promise<Result> | Thenable<Result>,
) => (input: Input): Thenable<Result> => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result as Thenable<Result>;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result as Result);
      },
      catch(_onRejected) {
        return this as Thenable<any>;
      },
    };
  } catch (e: any) {
    return {
      then(_onFulfilled) {
        return this as Thenable<any>;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      },
    };
  }
};

type PersistImpl = <T extends object>(
  storeInitializer: StoreInitializer<T, [], []>,
  options: PersistOptions<T, T>,
) => StoreInitializer<T, [], []>;

const persistImpl: PersistImpl = (config, baseOptions) => (
  setStore,
  getStore,
  api,
) => {
  type S = ReturnType<typeof config>;
  let options = {
    storage: createJSONStorage<S>(() => localStorage),
    partialize: (store: S) => store,
    version: 0,
    merge: (persistedStore: unknown, currentStore: S) => ({
      ...currentStore,
      ...(persistedStore as object),
    }),
    ...baseOptions,
  };

  let hasHydrated = false;
  const hydrationListeners = new Set<PersistListener<S>>();
  const finishHydrationListeners = new Set<PersistListener<S>>();
  let storage = options.storage;

  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[store/persist] Unable to update item "${options.name}", the given storage is currently unavailable.`,
        );
        setStore(...(args as Parameters<typeof setStore>));
      },
      getStore,
      api,
    );
  }

  const setItem = () => {
    const store = options.partialize({ ...getStore() });
    return (storage as PersistStorage<S>).setItem(options.name, {
      store,
      version: options.version,
    });
  };

  const savedSetStore = api.setStore;
  api.setStore = (store, replace) => {
    savedSetStore(store, replace as any);
    void setItem();
  };

  const configResult = config(
    (...args) => {
      setStore(...(args as Parameters<typeof setStore>));
      void setItem();
    },
    getStore,
    api,
  );
  api.getInitialStore = () => configResult;

  let storeFromStorage: S | undefined;
  const hydrate = () => {
    if (!storage) return;

    hasHydrated = false;
    hydrationListeners.forEach((cb) => cb(getStore() ?? configResult));
    const postRehydrationCallback =
      options.onRehydrateStorage?.(getStore() ?? configResult) || undefined;

    return toThenable(storage.getItem.bind(storage))(options.name)
      .then((deserializedStorageValue) => {
        if (deserializedStorageValue) {
          if (
            typeof deserializedStorageValue.version === "number" &&
            deserializedStorageValue.version !== options.version
          ) {
            if (options.migrate) {
              const migration = options.migrate(
                deserializedStorageValue.store,
                deserializedStorageValue.version,
              );
              if (migration instanceof Promise)
                return migration.then((result) => [true, result] as const);
              return [true, migration] as const;
            }
            console.error(
              `Store loaded from storage couldn"t be migrated since no migrate function was provided`,
            );
          } else {
            return [false, deserializedStorageValue.store] as const;
          }
        }
        return [false, undefined] as const;
      })
      .then((migrationResult) => {
        const [migrated, migratedStore] = migrationResult;
        storeFromStorage = options.merge(
          migratedStore as S,
          getStore() ?? configResult,
        );
        setStore(storeFromStorage as S, true);
        if (migrated) return setItem();
      })
      .then(() => {
        postRehydrationCallback?.(storeFromStorage, undefined);
        storeFromStorage = getStore();
        hasHydrated = true;
        finishHydrationListeners.forEach((cb) => cb(storeFromStorage as S));
      })
      .catch((e: Error) => {
        postRehydrationCallback?.(undefined, e);
      });
  };

  (api as StoreApi<S> & StorePersist<S, S>).persist = {
    setOptions: (newOptions) => {
      options = { ...options, ...newOptions };
      if (newOptions.storage) storage = newOptions.storage;
    },
    clearStorage: () => storage?.removeItem(options.name),
    getOptions: () => options,
    rehydrate: () => hydrate() as Promise<void>,
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => hydrationListeners.delete(cb);
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => finishHydrationListeners.delete(cb);
    },
  };

  if (!options.skipHydration) hydrate();

  return storeFromStorage || configResult;
};

export type Persist = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
>(
  initializer: StoreInitializer<T, [...Mps, ["store/persist", unknown]], Mcs>,
  options: PersistOptions<T, U>,
) => StoreInitializer<T, Mps, [["store/persist", U], ...Mcs]>;

export const persist = persistImpl as unknown as Persist;

type ReducerImpl = <T extends object, A extends ReducerAction>(
  reducerFn: (store: T, action: A) => T,
  initialStore: T,
) => StoreInitializer<T & StoreWithReducer<A>, [], []>;

const reducerImpl: ReducerImpl = (reducerFn, initial) => (
  setStore,
  _getStore,
  api,
) => {
  type S = typeof initial;
  type A = Parameters<typeof reducerFn>[1];

  (api as any).dispatch = (action: A) => {
    setStore((store: S) => reducerFn(store, action), false);
    return action;
  };

  return { dispatch: (...args) => (api as any).dispatch(...args), ...initial };
};

export type ReducerMiddleware = <
  T extends object,
  A extends ReducerAction,
  Cms extends [StoreMutatorIdentifier, unknown][] = [],
>(
  reducerFn: (store: T, action: A) => T,
  initialStore: T,
) => StoreInitializer<Write<T, StoreWithReducer<A>>, Cms, [["store/reducer", A]]>;

export const reducer = reducerImpl as unknown as ReducerMiddleware;

type SubscribeWithSelectorImpl = <T extends object>(
  storeInitializer: StoreInitializer<T, [], []>,
) => StoreInitializer<T, [], []>;

const subscribeWithSelectorImpl: SubscribeWithSelectorImpl = (fn) => (
  setStore,
  getStore,
  api,
) => {
  type S = ReturnType<typeof fn>;
  type Listener = (store: S, previousStore: S) => void;

  const origSubscribe = api.subscribe as (listener: Listener) => () => void;

  api.subscribe = ((selector: any, optListener: any, options: any) => {
    let listener: Listener = selector;
    if (optListener) {
      const equalityFn = options?.equalityFn || Object.is;
      let currentSlice = selector(api.getStore());

      listener = (store) => {
        const nextSlice = selector(store);
        if (!equalityFn(currentSlice, nextSlice)) {
          const previousSlice = currentSlice;
          optListener((currentSlice = nextSlice), previousSlice);
        }
      };
      if (options?.fireImmediately) {
        optListener(currentSlice, currentSlice);
      }
    }
    return origSubscribe(listener);
  }) as any;

  const initialStore = fn(setStore, getStore, api);
  return initialStore;
};

export type SubscribeWithSelector = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StoreInitializer<
    T,
    [...Mps, ["store/subscribeWithSelector", never]],
    Mcs
  >,
) => StoreInitializer<
  T,
  Mps,
  [["store/subscribeWithSelector", never], ...Mcs]
>;

export const subscribeWithSelector =
  subscribeWithSelectorImpl as unknown as SubscribeWithSelector;