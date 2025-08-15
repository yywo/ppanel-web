// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** Get batch send email task list GET /v1/admin/marketing/email/batch/list */
export async function getBatchSendEmailTaskList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetBatchSendEmailTaskListParams,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: API.GetBatchSendEmailTaskListResponse }>(
    '/v1/admin/marketing/email/batch/list',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** Get pre-send email count POST /v1/admin/marketing/email/batch/pre-send-count */
export async function getPreSendEmailCount(
  body: API.GetPreSendEmailCountRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: API.GetPreSendEmailCountResponse }>(
    '/v1/admin/marketing/email/batch/pre-send-count',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** Create a batch send email task POST /v1/admin/marketing/email/batch/send */
export async function createBatchSendEmailTask(
  body: API.CreateBatchSendEmailTaskRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/admin/marketing/email/batch/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Get batch send email task status POST /v1/admin/marketing/email/batch/status */
export async function getBatchSendEmailTaskStatus(
  body: API.GetBatchSendEmailTaskStatusRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: API.GetBatchSendEmailTaskStatusResponse }>(
    '/v1/admin/marketing/email/batch/status',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** Stop a batch send email task POST /v1/admin/marketing/email/batch/stop */
export async function stopBatchSendEmailTask(
  body: API.StopBatchSendEmailTaskRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: any }>('/v1/admin/marketing/email/batch/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
