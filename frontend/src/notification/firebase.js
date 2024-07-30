import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// add here your firebase config code
const firebaseConfig = {};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export default app;

