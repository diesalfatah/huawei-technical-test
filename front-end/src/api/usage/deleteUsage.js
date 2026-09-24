import { http } from '../http'

export async function deleteUsage(id) {
    await http.delete(`/usage/${id}`)
}
