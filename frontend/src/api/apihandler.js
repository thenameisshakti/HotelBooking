import axios from "axios"

const api = axios.create({
  baseURL: "/",
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await api.post("api/v1/users/refreshAccessToken")
        return api(originalRequest)
      } catch {
        console.log("ok")
        localStorage.removeItem("user")
        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  }
)

export default api
