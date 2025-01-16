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
      enable_login_verify: false,
      enable_register_verify: false,
      enable_reset_password_verify: false,
      turnstile_site_key: '',
    },
    auth: {
      sms: {
        sms_enabled: false,
        sms_limit: 0,
        sms_interval: 0,
        sms_expire_time: 0,
      },
      email: {
        email_enabled: false,
        email_enable_verify: false,
        email_enable_domain_suffix: false,
        email_domain_suffix_list: '',
      },
      register: {
        stop_register: false,
        enable_trial: false,
        enable_ip_register_limit: false,
        ip_register_limit: 0,
        ip_register_limit_duration: 0,
      },
    },
    register: {
      stop_register: false,
      enable_email_verify: false,
      enable_email_domain_suffix: false,
      email_domain_suffix_list: '',
      enable_trial: false,
      enable_ip_register_limit: false,
      ip_register_limit: 0,
      ip_register_limit_duration: 0,
      sms: {
        sms_enabled: false,
        sms_limit: 0,
        sms_interval: 0,
        sms_expire_time: 0,
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
      access_key: '',
    },
    subscribe: {
      single_model: false,
      subscribe_path: '',
      subscribe_domain: '',
      pan_domain: false,
    },
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
