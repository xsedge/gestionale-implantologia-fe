import axios from 'axios'
import { Dialog } from 'quasar'
import ErrorDialog from "src/components/ErrorDialog.vue"



// ✅ La tua API Key (in alternativa puoi prenderla da .env)
const API_KEY = import.meta.env.VITE_API_KEY || 'inserisci-la-tua-api-key'

// Axios instance
//console.log('Axios baseURL:', import.meta.env.VITE_API_URL  )
const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false,
    transformResponse: [data => data],
    timeout: 30000
})

// ➕ Interceptor richiesta: inserisce automaticamente l'API Key
http.interceptors.request.use(
    config => {
        config.headers['x-api-key'] = API_KEY
        return config
    },
    error => Promise.reject(error)
)

// 🧠 Interceptor risposta
http.interceptors.response.use(
    response => {
        // Ora che transformResponse: [data => data] è impostato,
        // response.data sarà la stringa JSON raw. Dobbiamo parsarlo.
        try {
            //console.log('Risposta prima:', response.data);
            const resp = JSON.parse(response.data);
            //console.log('Risposta dopo:', resp);
            return resp;
        } catch (e) {
            console.error('Errore nel parsing JSON della risposta:', e);
            // Se il parsing fallisce, restituisci i dati così come sono o rigetta l'errore
            return response.data; // Oppure throw e; se vuoi che l'errore si propaghi
        }
    },
    error => {

        const originalRequest = error.config
        const responseData = error.response?.data
        const status = error.response?.status
        let message = responseData?.['message'] || `Errore di comunicazione: <strong>${status}</strong>`

        const apiError = responseData?.['apierror']
        const subErrors = apiError?.['subErrors']
        let listErrors = []

        // 🔍 Parsing blob JSON se necessario
        if (
            error.request?.responseType === 'blob' &&
            error.response?.data instanceof Blob &&
            error.response.data.type?.toLowerCase().includes('json')
        ) {
            new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                    error.response.data = JSON.parse(reader.result)
                    resolve(Promise.reject(error))
                }
                reader.onerror = () => reject(error)
                reader.readAsText(error.response.data)
            }).catch(errorBlob => {
                const apiErrorBlob = errorBlob.response?.data?.['apierror']
                const apiErrorSubErrors = apiErrorBlob?.['subErrors']
                const messageBlob = `${apiErrorBlob?.message}`

                if (Array.isArray(apiErrorSubErrors)) {
                    apiErrorSubErrors.forEach(err => {
                        listErrors.push(`<strong>${err.field}:</strong> ${err.message}`)
                    })
                }

                if (listErrors.length > 0) {
                    message += '<br/><br/>' + listErrors.join('<br/><br/>\n')
                }

                Dialog.create({
                    component: ErrorDialog,
                    componentProps: {
                        text: messageBlob,
                        typology: 'negative',
                        icon: 'block',
                        color: 'negative',
                        traceId: {
                            timestamp: apiErrorBlob?.timestamp,
                            traceId: apiErrorBlob?.traceId
                        }
                    }
                })
            })
        }

        // ⚠️ Gestione struttura errori custom (apierror)
        if (apiError) {
            message = apiError.message

            if (Array.isArray(subErrors)) {
                subErrors.forEach(err => {
                    listErrors.push(`<strong>${err.field}:</strong> ${err.message}`)
                })
            }

            if (listErrors.length > 0) {
                message += '<br/><br/>' + listErrors.join('<br/><br/>\n')
            }

            Dialog.create({
                component: ErrorDialog,
                componentProps: {
                    text: message,
                    typology: 'negative',
                    icon: 'block',
                    color: 'negative',
                    traceId: {
                        timestamp: apiError.timestamp,
                        traceId: apiError.traceId
                    }
                }
            })
        }

        // ⚠️ Gestione specifica per 400
        if (status === 400 && responseData?.error_description) {
            message = responseData.error_description
        }

        // ❌ Nessuna risposta ricevuta
        if (!error.response) {
            message = error.message || 'Errore di comunicazione'
        }

        // 🔔 Mostra l’errore se non in modalità silenziosa
        if (!originalRequest?.silent) {
            console.warn('Errore:', message)
        }

        return Promise.reject(error)
    }
)

export default http
