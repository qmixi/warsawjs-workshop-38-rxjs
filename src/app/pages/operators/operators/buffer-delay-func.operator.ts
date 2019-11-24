import {
  MonoTypeOperatorFunction,
  Observable,
  BehaviorSubject,
  zip,
  pipe,
  asyncScheduler
} from "rxjs";
import { filter, map, tap, finalize } from "rxjs/operators";
import { Timeouts } from "selenium-webdriver";

export const bufferDelayFunc = <T>(
  time: number
): MonoTypeOperatorFunction<T> => (source: Observable<T>): Observable<T> => {
  return new Observable<T>(observer => {
    const gate = new BehaviorSubject(true);
    const gateOpen$ = gate.pipe(filter(x => x));
    const zipped = zip(source, gateOpen$);
    let timeout;

    return zipped
      .pipe(
        map(([input]) => input),
        tap(() => {
          gate.next(false);
          timeout = asyncScheduler.schedule(() => {
            gate.next(true);
          }, time);
        }),
        finalize(() => {
          // clearTimeout(timeout);
          timeout.unsubscribe();
        })
      )
      .subscribe({
        next(x) {
          console.log("x", x);
          observer.next(x);
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        }
      });
  });
};
