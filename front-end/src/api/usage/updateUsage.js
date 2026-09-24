import { http } from '../http'

export async function updateUsage(id, payload) {
    const { data } = await http.patch(`/usage/${id}`, payload)
    return data
}