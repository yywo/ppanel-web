declare namespace API {
  type Announcement = {
    id: number;
    title: string;
    content: string;
    show: boolean;
    pinned: boolean;
    popup: boolean;
    created_at: number;
    updated_at: number;
  };

  type Application = {
    id: number;
    icon: string;
    name: string;
    description: string;
    subscribe_type: string;
  };

  type ApplicationConfig = {
    encryption: boolean;
    domains: string[];
    startup_picture: string;
    startup_picture_skip_time: number;
  };

  type ApplicationPlatform = {
    ios?: ApplicationVersion[];
    mac?: ApplicationVersion[];
    linux?: ApplicationVersion[];
    android?: ApplicationVersion[];
    windows?: ApplicationVersion[];
    harmony?: ApplicationVersion[];
  };

  type ApplicationResponse = {
    applications: ApplicationResponseInfo[];
  };

  type ApplicationResponseInfo = {
    id: number;
    name: string;
    icon: string;
    description: string;
    subscribe_type: string;
    platform: ApplicationPlatform;
  };

  type ApplicationVersion = {
    id: number;
    url: string;
    version: string;
    description: string;
    is_default: boolean;
  };

  type AuthConfig = {
    sms: SmsAuthenticateConfig;
    email: EmailAuthticateConfig;
    register: RegisterConfig;
  };

  type CheckUserParams = {
    email: string;
  };

  type CheckUserRequest = {
    email: string;
  };

  type CheckUserResponse = {
    exist: boolean;
  };

  type CheckUserTelephoneParams = {
    telephone: string;
  };

  type Coupon = {
    id: number;
    name: string;
    code: string;
    count: number;
    type: number;
    discount: number;
    start_time: number;
    expire_time: number;
    user_limit: number;
    subscribe: number[];
    used_count: number;
    enable: boolean;
    created_at: number;
    updated_at: number;
  };

  type CurrencyConfig = {
    currency_unit: string;
    currency_symbol: string;
  };

  type Document = {
    id: number;
    title: string;
    content: string;
    tags: string[];
    show: boolean;
    created_at: number;
    updated_at: number;
  };

  type EmailAuthticateConfig = {
    email_enabled: boolean;
    email_enable_verify: boolean;
    email_enable_domain_suffix: boolean;
    email_domain_suffix_list: string;
  };

  type EmailSmtpConfig = {
    email_enabled: boolean;
    email_smtp_host: string;
    email_smtp_port: number;
    email_smtp_user: string;
    email_smtp_pass: string;
    email_smtp_from: string;
    email_smtp_ssl: boolean;
    verify_email_template: string;
    maintenance_email_template: string;
    expiration_email_template: string;
    email_enable_verify: boolean;
    email_enable_domain_suffix: boolean;
    email_domain_suffix_list: string;
  };

  type Follow = {
    id: number;
    ticket_id: number;
    from: string;
    type: number;
    content: string;
    created_at: number;
  };

  type GetAppcationResponse = {
    config: ApplicationConfig;
    applications: ApplicationResponseInfo[];
  };

  type GetGlobalConfigResponse = {
    site: SiteConfig;
    verify: VeifyConfig;
    auth: AuthConfig;
    invite: InviteConfig;
    currency: CurrencyConfig;
    subscribe: SubscribeConfig;
  };

  type GetStatResponse = {
    user: number;
    node: number;
    country: number;
    protocol: string[];
  };

  type GetSubscriptionResponse = {
    list: Subscribe[];
  };

  type GetTosResponse = {
    tos_content: string;
  };

  type Hysteria2 = {
    port: number;
    hop_ports: string;
    hop_interval: number;
    obfs_password: string;
    security_config: SecurityConfig;
  };

  type InviteConfig = {
    forced_invite: boolean;
    referral_percentage: number;
    only_first_purchase: boolean;
  };

  type LoginResponse = {
    token: string;
  };

  type NodeConfig = {
    node_secret: string;
    node_pull_interval: number;
    node_push_interval: number;
  };

  type NodeRelay = {
    host: string;
    port: number;
    prefix: string;
  };

  type NodeStatus = {
    online_users: OnlineUser[];
    status: ServerStatus;
    last_at: number;
  };

  type OAthLoginRequest = {
    /** google, facebook, apple, telegram, github etc. */
    method: string;
  };

  type OAuthLoginResponse = {
    redirect: string;
  };

  type OAuthMethod = {
    id: number;
    platform: string;
    config: Record<string, any>;
    redirect: string;
    enabled: boolean;
    created_at: number;
    updated_at: number;
  };

  type OnlineUser = {
    uid: number;
    ip: string;
  };

  type Order = {
    id: number;
    user_id: number;
    order_no: string;
    type: number;
    quantity: number;
    price: number;
    amount: number;
    gift_amount: number;
    discount: number;
    coupon: string;
    coupon_discount: number;
    commission?: number;
    method: string;
    fee_amount: number;
    trade_no: string;
    status: number;
    subscribe_id: number;
    created_at: number;
    updated_at: number;
  };

  type OrderDetail = {
    id: number;
    user_id: number;
    order_no: string;
    type: number;
    quantity: number;
    price: number;
    amount: number;
    gift_amount: number;
    discount: number;
    coupon: string;
    coupon_discount: number;
    commission?: number;
    method: string;
    fee_amount: number;
    trade_no: string;
    status: number;
    subscribe_id: number;
    subscribe: Subscribe;
    created_at: number;
    updated_at: number;
  };

  type PaymentConfig = {
    id: number;
    name: string;
    mark: string;
    icon?: string;
    domain?: string;
    config: Record<string, any>;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    enable: boolean;
  };

  type RegisterConfig = {
    stop_register: boolean;
    enable_trial: boolean;
    enable_ip_register_limit: boolean;
    ip_register_limit: number;
    ip_register_limit_duration: number;
  };

  type ResetPasswordRequest = {
    email: string;
    password: string;
    code?: string;
    cf_token?: string;
  };

  type Response = {
    /** 状态码 */
    code?: number;
    /** 消息 */
    msg?: string;
    /** 数据 */
    data?: Record<string, any>;
  };

  type SecurityConfig = {
    sni: string;
    allow_insecure: boolean;
    fingerprint: string;
    reality_server_addr: string;
    reality_server_port: number;
    reality_private_key: string;
    reality_public_key: string;
    reality_short_id: string;
  };

  type SendCodeRequest = {
    email: string;
    type: number;
  };

  type SendCodeResponse = {
    code?: string;
    status: boolean;
  };

  type SendSmsCodeRequest = {
    telephone: string;
    telephone_area_code: string;
  };

  type Server = {
    id: number;
    tags: string[];
    country: string;
    city: string;
    name: string;
    server_addr: string;
    relay_mode: string;
    relay_node: NodeRelay[];
    speed_limit: number;
    traffic_ratio: number;
    group_id: number;
    protocol: string;
    config: Record<string, any>;
    enable: boolean;
    created_at: number;
    updated_at: number;
    status: NodeStatus;
    sort: number;
  };

  type ServerGroup = {
    id: number;
    name: string;
    description: string;
    created_at: number;
    updated_at: number;
  };

  type ServerStatus = {
    cpu: number;
    mem: number;
    disk: number;
    updated_at: number;
  };

  type Shadowsocks = {
    method: string;
    port: number;
    server_key: string;
  };

  type SiteConfig = {
    host: string;
    site_name: string;
    site_desc: string;
    site_logo: string;
  };

  type SmsAuthenticateConfig = {
    sms_enabled: boolean;
    sms_limit: number;
    sms_interval: number;
    sms_expire_time: number;
  };

  type SmsConfig = {
    sms_enabled: boolean;
    sms_key: string;
    sms_secret: string;
    sms_template: string;
    sms_template_code: string;
    sms_template_param: string;
    sms_platform: string;
    sms_limit: number;
    sms_interval: number;
    sms_expire_time: number;
  };

  type SortItem = {
    id: number;
    sort: number;
  };

  type Subscribe = {
    id: number;
    name: string;
    description: string;
    unit_price: number;
    unit_time: string;
    discount: SubscribeDiscount[];
    replacement: number;
    inventory: number;
    traffic: number;
    speed_limit: number;
    device_limit: number;
    quota: number;
    group_id: number;
    server_group: number[];
    server: number[];
    show: boolean;
    sell: boolean;
    sort: number;
    deduction_ratio: number;
    allow_deduction: boolean;
    reset_cycle: number;
    renewal_reset: boolean;
    created_at: number;
    updated_at: number;
  };

  type SubscribeConfig = {
    single_model: boolean;
    subscribe_path: string;
    subscribe_domain: string;
    pan_domain: boolean;
  };

  type SubscribeDiscount = {
    quantity: number;
    discount: number;
  };

  type SubscribeGroup = {
    id: number;
    name: string;
    description: string;
    created_at: number;
    updated_at: number;
  };

  type SubscribeType = {
    subscribe_types: string[];
  };

  type TelegramConfig = {
    telegram_bot_token: string;
    telegram_group_url: string;
    telegram_notify: boolean;
    telegram_web_hook_domain: string;
  };

  type TelephoneCheckUserRequest = {
    telephone_area_code: string;
  };

  type TelephoneCheckUserResponse = {
    exist: boolean;
  };

  type TelephoneLoginRequest = {
    telephone: string;
    telephone_code: string;
    telephone_area_code: string;
    password: string;
    cf_token?: string;
  };

  type TelephoneRegisterRequest = {
    telephone: string;
    telephone_area_code: string;
    password: string;
    invite?: string;
    code?: string;
    cf_token?: string;
  };

  type TelephoneResetPasswordRequest = {
    telephone: string;
    telephone_area_code: string;
    password: string;
    code?: string;
    cf_token?: string;
  };

  type Ticket = {
    id: number;
    title: string;
    description: string;
    user_id: number;
    follow?: Follow[];
    status: number;
    created_at: number;
    updated_at: number;
  };

  type TimePeriod = {
    start_time: string;
    end_time: string;
    multiplier: number;
  };

  type TosConfig = {
    tos_content: string;
  };

  type TransportConfig = {
    path: string;
    host: string;
    service_name: string;
  };

  type Trojan = {
    port: number;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type Tuic = {
    port: number;
    security_config: SecurityConfig;
  };

  type User = {
    id: number;
    email: string;
    telephone: string;
    telephone_area_code: string;
    avatar: string;
    balance: number;
    commission: number;
    gift_amount: number;
    telegram: number;
    refer_code: string;
    referer_id: number;
    enable: boolean;
    is_admin?: boolean;
    valid_email: boolean;
    enable_email_notify: boolean;
    enable_telegram_notify: boolean;
    enable_balance_notify: boolean;
    enable_login_notify: boolean;
    enable_subscribe_notify: boolean;
    enable_trade_notify: boolean;
    created_at: number;
    updated_at: number;
    deleted_at?: number;
    is_del?: boolean;
  };

  type UserAffiliate = {
    email: string;
    avatar: string;
    registered_at: number;
    enable: boolean;
  };

  type UserBalanceLog = {
    id: number;
    user_id: number;
    amount: number;
    type: number;
    order_id: number;
    balance: number;
    created_at: number;
  };

  type UserLoginRequest = {
    email: string;
    password: string;
    cf_token?: string;
  };

  type UserRegisterRequest = {
    email: string;
    password: string;
    invite?: string;
    code?: string;
    cf_token?: string;
  };

  type UserSubscribe = {
    id: number;
    user_id: number;
    order_id: number;
    subscribe_id: number;
    subscribe: Subscribe;
    start_time: number;
    expire_time: number;
    reset_time: number;
    traffic: number;
    download: number;
    upload: number;
    token: string;
    status: number;
    created_at: number;
    updated_at: number;
  };

  type VeifyConfig = {
    turnstile_site_key: string;
    enable_login_verify: boolean;
    enable_register_verify: boolean;
    enable_reset_password_verify: boolean;
  };

  type VerifyConfig = {
    turnstile_site_key: string;
    turnstile_secret: string;
    enable_login_verify: boolean;
    enable_register_verify: boolean;
    enable_reset_password_verify: boolean;
  };

  type Vless = {
    port: number;
    flow: string;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type Vmess = {
    port: number;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };
}
