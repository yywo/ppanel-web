// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** Get sms list GET /v1/admin/sms/list */
export async function getSmsList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetSmsListParams,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: API.GetSmsListResponse }>('/v1/admin/sms/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
