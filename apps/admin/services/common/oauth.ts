// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** Apple Login Callback POST /v1/auth/oauth/callback/apple */
export async function appleLoginCallback(
  body: {
    code: string;
    id_token: string;
    state: string;
  },
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.Response & { data?: any }>('/v1/auth/oauth/callback/apple', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** Facebook Login Callback GET /v1/auth/oauth/callback/facebook */
export async function facebookLoginCallback(options?: { [key: string]: any }) {
  return request<API.Response & { data?: any }>('/v1/auth/oauth/callback/facebook', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Google Login Callback GET /v1/auth/oauth/callback/google */
export async function googleLoginCallback(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GoogleLoginCallbackParams,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/auth/oauth/callback/google', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Telegram Login Callback GET /v1/auth/oauth/callback/telegram */
export async function telegramLoginCallback(options?: { [key: string]: any }) {
  return request<API.Response & { data?: any }>('/v1/auth/oauth/callback/telegram', {
    method: 'GET',
    ...(options || {}),
  });
}

/** OAuth login POST /v1/auth/oauth/login */
export async function oAuthLogin(body: API.OAthLoginRequest, options?: { [key: string]: any }) {
  return request<API.Response & { data?: API.OAuthLoginResponse }>('/v1/auth/oauth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
