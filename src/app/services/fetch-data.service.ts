import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, filter, finalize, map, share, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ConfigService} from '../pages/fetch-data/config.service';
import {ConfigData, PictureData} from '../pages/fetch-data/data';
import {PicturesService} from '../pages/fetch-data/pictures.service';

interface LoadableData<T> {
  data: T | null;
  loading: boolean;
}

const initialLoadable: LoadableData<any> = {
  data: null,
  loading: false,
};

export const muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>): Observable<R> =>
  combineLatest([first$, second$]).pipe(
    map(([_, b]) => b),
    distinctUntilChanged()
  );

export const getData = <T>(selectors: Selectors<T>, fetchData: () => Observable<T>, cancel: () => void): Observable<T> => {
  const require$ = selectors.need$.pipe(
    tap((need) => console.log('need:', need)),
    filter(need => need),
    switchMap(fetchData),
    finalize(cancel),
    switchMap(() => selectors.loaded$),
    share()
  );
  return muteFirst(require$.pipe(startWith(null)), selectors.data$);
};

export interface Selectors<T> {
  need$: Observable<boolean>;
  loaded$: Observable<boolean>;
  data$: Observable<T>;
}

@Injectable({
  providedIn: 'root'
})
export class FetchDataService {
  private config = new BehaviorSubject<LoadableData<ConfigData>>(initialLoadable);
  private pictures = new BehaviorSubject<LoadableData<PictureData[]>>(initialLoadable);

  private configCancel = new Subject();
  private picturesCancel = new Subject();

  private configSelectors: Selectors<ConfigData> = {
    data$: this.config.asObservable().pipe(map(configLoadable => configLoadable.data)),
    need$: this.config.asObservable().pipe(map(configLoadable => configLoadable.data === null && !configLoadable.loading)),
    loaded$: this.config.asObservable().pipe(map(configLoadable => configLoadable.data !== null && !configLoadable.loading)),
  };

  private picturesSelectors: Selectors<PictureData[]> = {
    data$: this.pictures.asObservable().pipe(map(configLoadable => configLoadable.data)),
    need$: this.pictures.asObservable().pipe(map(configLoadable => configLoadable.data === null && !configLoadable.loading)),
    loaded$: this.pictures.asObservable().pipe(map(configLoadable => configLoadable.data !== null && !configLoadable.loading)),
  };

  constructor(private configService: ConfigService, private pictureService: PicturesService) {
  }

  getConfig$(): Observable<ConfigData> {
    return getData<ConfigData>(
      this.configSelectors,
      () => this.fetchConfig(),
      () => this.configCancel.next()
    );
  }

  getPictures$(): Observable<string[]> {
    return this.getConfig$().pipe(
      filter(config => !!config),
      switchMap(({page}) => getData<PictureData[]>(
        this.picturesSelectors,
        () => this.fetchPictures(page),
        () => void this.picturesCancel.next()
        )
      ),
      filter(pictures => !!pictures),
      tap(pictures => console.log(pictures)),
      map(pictures => pictures.map(({id}) => `https://picsum.photos/id/${id}/300/300`))
    );
  }

  private fetchPictures(page: number): Observable<any> {
    this.pictures.next({
      ...this.pictures.getValue(),
      loading: true,
    });
    return this.pictureService.fetchPictures(page).pipe(
      tap(pictures => {
        this.pictures.next({
          data: pictures,
          loading: false,
        });
      }),
      finalize(() => {
        this.pictures.next({
          ...this.pictures.getValue(),
          loading: false,
        });
      }),
      takeUntil(this.picturesCancel)
    );
  }

  private fetchConfig(): Observable<any> {
    this.config.next({
      ...this.config.getValue(),
      loading: true,
    });
    return this.configService.fetchConfig().pipe(
      tap(config => {
        this.config.next({
          data: config,
          loading: false,
        });
      }),
      finalize(() => {
        this.config.next({
          ...this.config.getValue(),
          loading: false,
        });
      }),
      takeUntil(this.configCancel)
    );
  }

// getConfig$(): Observable<ConfigData> {
//   return this.configService.fetchConfig();
// }
//
// getPictures$(): Observable<string[]> {
//   return this.getConfig$().pipe(
//     switchMap(({page}) => this.pictureService.fetchPictures(page))
//   );
// }
}
