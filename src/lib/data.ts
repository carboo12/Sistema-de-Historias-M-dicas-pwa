import { useFirebaseBackend } from '../services/firebase/client';
import { firebaseApi } from '../services/firebase/api';
import { api as localApi } from './api';

export { ApiError } from './api';

export const api = (useFirebaseBackend ? firebaseApi : localApi) as typeof localApi;
