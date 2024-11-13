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
    register: {
      stop_register: false,
      enable_email_verify: false,
      enable_email_domain_suffix: false,
      email_domain_suffix_list: '',
    },
    invite: {
      forced_invite: false,
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
