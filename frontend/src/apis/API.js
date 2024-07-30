const BASE_URL = process.env.REACT_APP_BASE_URL

const API = {
    LOGIN: BASE_URL + '/login',
    GENERATE_OTP: BASE_URL + '/generate-otp',
    VERIFY_OTP: BASE_URL + '/verify-otp',
    REGISTER_USER: BASE_URL + '/register',
    SAVE_REMINDER: BASE_URL + '/save-reminder'
}

export default API
export { BASE_URL }
