// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** get app config GET /v1/admin/app/config */
export async function getAppConfig(options?: { [key: string]: any }) {
  return request<API.Response & { data?: API.AppConfig }>('/v1/admin/app/config', {
    method: 'GET',
    ...(options || {}),
  });
}

/** update app config PUT /v1/admin/app/config */
export async function updateAppConfig(body: API.AppConfig, options?: { [key: string]: any }) {
  return request<API.Response & { data?: any }>('/v1/admin/app/config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** update app version PUT /v1/admin/app/version */
export async function updateAppVersion(
  body: API.UpdateAppVersionRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/admin/app/version', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** create app version POST /v1/admin/app/version */
export async function createAppVersion(
  body: API.CreateAppVersionRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/admin/app/version', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** delete app version DELETE /v1/admin/app/version */
export async function deleteAppVersionInfo(
  body: API.DeleteAppVersionRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/admin/app/version', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** set default app version PUT /v1/admin/app/version_default */
export async function setDefaultAppVersionInfo(
  body: API.DefaultAppVersionRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/admin/app/version_default', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** query app version info GET /v1/admin/app/version_list */
export async function getAppVersionList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetAppVersionListParams,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: API.GetAppVersionListResponse }>(
    '/v1/admin/app/version_list',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
