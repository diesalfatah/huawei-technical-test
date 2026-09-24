import { http } from '../http'

export async function createUsage(payload) {
    const { data } = await http.post('/usage', payload)
    return data
}