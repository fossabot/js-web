export interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel(): void;
}

/**
 * Make cancelable promise.
 * @param promise Actual promise
 * @returns Cancelable promise
 */
export function makeCancelablePromise(promise): CancelablePromise<any> {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      (error) => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error)),
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
}
