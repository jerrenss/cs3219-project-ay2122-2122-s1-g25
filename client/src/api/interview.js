import { GETRequest, PUTRequest } from '../config/axios'

export const getInterview = (iSessionId) => {
  return GETRequest(`/interview/${iSessionId}`)
}

export const updateInterview = (iSessionId, data) => {
  return PUTRequest(`/interview/${iSessionId}`, data)
}