import { EconomySimulator, Product } from './EconomySimulator';
import { RealtimeMock } from './RealtimeMock';
import productsConfig from '../products.json';
import designConfig from '../design-config.json';

export class MockContext {
  private userId: string;
  private subredditId: string;
  private bucketId: string;
  public reddit: any;
  public redis: any;
  public realtime: RealtimeMock;
  public kv: any;
  public media: any;
  public ui: any;
  public config: typeof designConfig;
  private _state: Map<string, any>;
  private economy: EconomySimulator;

  constructor(data: any = {}) {
    this.userId = data.userId || 't2_user123';
    this.subredditId = data.subredditId || 't5_sub456';
    this.bucketId = data.bucketId || (Math.random() > 0.5 ? 'treatment' : 'control');
    this.config = designConfig;
    this.economy = new EconomySimulator(data.initialProducts || productsConfig);
    this.reddit = this._mockReddit();
    this.redis = this._mockRedis();
    this.realtime = new RealtimeMock();
    this.kv = this._mockKV();
    this.media = this._mockMedia();
    this._state = new Map();
    this.ui = this._mockUI();
  }

  getBucket() {
    return this.bucketId;
  }

  useState<T>(initialValue: T): [T, (newValue: T | ((prev: T) => T)) => void] {
    const key = JSON.stringify(initialValue);
    if (!this._state.has(key)) {
      this._state.set(key, initialValue);
    }
    return [
      this._state.get(key),
      (newValue: T | ((prev: T) => T)) => {
        const prevValue = this._state.get(key);
        const resolvedValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue) : newValue;
        this._state.set(key, resolvedValue);
      }
    ];
  }

  _mockReddit() {
    return {
      getCurrentUser: async () => ({ id: this.userId, name: 'dummy_user' }),
      getSubredditById: async (id: string) => ({ id, name: 'test_sub' }),
      getCurrentSubreddit: async () => ({ id: this.subredditId, name: 'test_sub' }),
      getProducts: async () => this.economy.getProducts(),
      pay: async (options: { productId: string }) => {
        const product = this.economy.getProduct(options.productId);
        const result = this.economy.purchase(options.productId);

        // In a real browser harness, this would trigger the EconomyModal
        console.log(`[MockEconomy] Triggering Modal for ${product?.name || options.productId}`);

        return result.success ? { status: 'success' } : { status: 'failed', reason: result.reason };
      }
    };
  }

  _mockRedis() {
    const storage = new Map<string, any>();
    // Robust check for Node environment
    const IS_NODE = typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null;
    const SERVER_STORAGE_FILE = '.dolores_redis_dump.json';
    const BROWSER_STORAGE_KEY = 'dolores_redis_dump';

    // Load initial state
    if (IS_NODE) {
      try {
        const fs = require('fs');
        if (fs.existsSync(SERVER_STORAGE_FILE)) {
          const data = JSON.parse(fs.readFileSync(SERVER_STORAGE_FILE, 'utf-8'));
          Object.entries(data).forEach(([k, v]) => storage.set(k, v));
          console.log('[MockRedis] Loaded persistent state from disk.');
        }
      } catch (e) {
        console.warn('[MockRedis] Failed to load persistent state:', e);
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(BROWSER_STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          Object.entries(parsed).forEach(([k, v]) => storage.set(k, v));
          console.log('[MockRedis] Loaded persistent state from localStorage.');
        }
      } catch (e) {
        console.warn('[MockRedis] Failed to load localStorage:', e);
      }
    }

    const saveState = () => {
      const data = Object.fromEntries(storage);
      const json = JSON.stringify(data, null, 2);

      if (IS_NODE) {
        try {
          const fs = require('fs');
          fs.writeFileSync(SERVER_STORAGE_FILE, json);
        } catch (e) {
          console.error('[MockRedis] Persistence failed:', e);
        }
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BROWSER_STORAGE_KEY, json);
      }
    };

    return {
      get: async (key: string) => storage.get(key),
      set: async (key: string, value: any) => {
        storage.set(key, value);
        saveState();
      },
      del: async (key: string) => {
        storage.delete(key);
        saveState();
      },
      hGet: async (key: string, field: string) => (storage.get(key) || {})[field],
      hSet: async (key: string, field: string, value: any) => {
        const obj = storage.get(key) || {};
        obj[field] = value;
        storage.set(key, obj);
        saveState();
      }
    };
  }

  _mockKV() {
    const storage = new Map<string, any>();
    return {
      get: async (key: string) => storage.get(key),
      put: async (key: string, value: any) => { storage.set(key, value); },
      delete: async (key: string) => { storage.delete(key); },
      list: async () => Array.from(storage.keys())
    };
  }

  _mockMedia() {
    return {
      upload: async (url: string) => ({ id: `media_${Math.random().toString(36).substr(2, 9)}`, url }),
      getMediaById: async (id: string) => ({ id, url: `https://mock.reddit.com/${id}.jpg` })
    };
  }

  _mockUI() {
    return {
      showToast: (options: string | { text: string }) => {
        console.log(`[MockUI] Toast: ${typeof options === 'string' ? options : options.text}`);
      },
      navigateTo: (url: string) => {
        console.log(`[MockUI] Navigating to: ${url}`);
      },
      showForm: (formId: string) => {
        console.log(`[MockUI] Showing form: ${formId}`);
        return Promise.resolve({ values: {} });
      }
    };
  }
}
