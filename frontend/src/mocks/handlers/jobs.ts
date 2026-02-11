import { http, HttpResponse } from 'msw'
import { mockJobs, mockJobHistory } from '../data/jobs'

export const jobHandlers = [
  // GET jobs list
  http.get('*/v1/tenants/:tenantId/jobs', () => {
    return HttpResponse.json(mockJobs)
  }),

  // GET job history
  http.get('*/v1/tenants/:tenantId/jobs/history', () => {
    return HttpResponse.json(mockJobHistory)
  }),

  // POST trigger depreciation run
  http.post('*/v1/tenants/:tenantId/jobs/depreciation/run', () => {
    return HttpResponse.json({
      jobId: 'job-dep-' + Date.now(),
      message: 'Depreciation job has been queued successfully.',
    })
  }),

  // POST trigger post all depreciation
  http.post('*/v1/tenants/:tenantId/jobs/depreciation/post-all', () => {
    return HttpResponse.json({
      jobId: 'job-dep-post-' + Date.now(),
      message: 'Post all depreciation job has been queued successfully.',
    })
  }),

  // POST trigger recurring vouchers
  http.post('*/v1/tenants/:tenantId/jobs/recurring-vouchers/run', () => {
    return HttpResponse.json({
      jobId: 'job-rv-' + Date.now(),
      message: 'Recurring voucher processing job has been queued successfully.',
    })
  }),

  // POST trigger amortization
  http.post('*/v1/tenants/:tenantId/jobs/amortization/run', () => {
    return HttpResponse.json({
      jobId: 'job-amort-' + Date.now(),
      message: 'Amortization job has been queued successfully.',
    })
  }),

  // GET job status by id
  http.get('*/v1/tenants/:tenantId/jobs/:jobId/status', ({ params }) => {
    return HttpResponse.json({
      jobId: params.jobId as string,
      state: 'Succeeded',
      createdAt: new Date().toISOString(),
      job: 'ManualTrigger',
    })
  }),
]
