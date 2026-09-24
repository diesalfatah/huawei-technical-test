import { http } from '../http'

export async function loginApi({ username, password}) {
    const { data } = await http.post('/auth/login', { username, password })
    return data
}

export async function meApi() {
    const { data } = await http.get('/auth/me')
    return data
}
