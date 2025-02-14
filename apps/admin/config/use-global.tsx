import { create } from 'zustand';

export interface GlobalStore {
  common: API.GetGlobalConfigResponse;
  user?: API.User;
  setCommon: (common: Partial<API.GetGlobalConfigResponse>) => void;
  setUser: (user?: API.User) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  common: {
    site: {
      host: '',
      site_name: '',
      site_desc: '',
      site_logo: '',
    },
    verify: {
      turnstile_site_key: '',
      enable_login_verify: false,
      enable_register_verify: false,
      enable_reset_password_verify: false,
    },
    auth: {
      mobile: {
        enable: false,
        limit: 0,
        interval: 0,
        expire_time: 0,
      },
      email: {
        enable: false,
        enable_verify: false,
        enable_domain_suffix: false,
        domain_suffix_list: '',
      },
      register: {
        stop_register: false,
        enable_trial: false,
        trial_subscribe: 0,
        trial_time: 0,
        trial_time_unit: '',
        enable_ip_register_limit: false,
        ip_register_limit: 0,
        ip_register_limit_duration: 0,
      },
    },
    invite: {
      forced_invite: false,
      referral_percentage: 0,
      only_first_purchase: false,
    },
    currency: {
      currency_unit: 'USD',
      currency_symbol: '$',
    },
    subscribe: {
      single_model: false,
      subscribe_path: '',
      subscribe_domain: '',
      pan_domain: false,
    },
    verify_code: {
      verify_code_expire_time: 5,
      verify_code_limit: 15,
      verify_code_interval: 60,
    },
    oauth_methods: [],
  },
  user: undefined,
  setCommon: (common) =>
    set((state) => ({
      common: {
        ...state.common,
        ...common,
      },
    })),
  setUser: (user) => set({ user }),
}));

export default useGlobalStore;
