import { http } from '../http'

export async function getListUsage(subscriberId) {
    const params = subscriberId ? { subscriberId } : undefined
    const { data } = await http.get('/usage', { params })
    return data
}