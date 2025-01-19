// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** Apple Login Callback POST /v1/auth/oauth/callback/apple */
export async function appleLoginCallback(options?: { [key: string]: any }) {
  return request<API.Response & { data?: any }>('/v1/auth/oauth/callback/apple', {
    method: 'POST',
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
export async function googleLoginCallback(options?: { [key: string]: any }) {
  return request<API.Response & { data?: any }>('/v1/auth/oauth/callback/google', {
    method: 'GET',
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
