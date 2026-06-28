import toast from 'react-hot-toast';

export function showSuccess(message: string) {
  toast.success(message, { duration: 3000 });
}

export function showError(message: string) {
  toast.error(message, { duration: 5000 });
}

export function showInfo(message: string) {
  toast(message, { duration: 3000 });
}

export function showPromise<T>(
  promise: Promise<T>,
  loading: string,
  success: string,
  error: string
): Promise<T> {
  return toast.promise(promise, { loading, success, error });
}