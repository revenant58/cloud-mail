import http from '@/axios/index.js';

export function apiKeyCreate(form) {
    return http.post('/apiKey/create', form)
}

export function apiKeyList() {
    return http.get('/apiKey/list')
}

export function apiKeyUpdate(form) {
    return http.put('/apiKey/update', form)
}

export function apiKeyDelete(apiKeyIds) {
    return http.delete('/apiKey/delete?apiKeyIds=' + apiKeyIds)
}
