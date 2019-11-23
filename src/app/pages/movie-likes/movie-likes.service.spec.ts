import { TestBed } from '@angular/core/testing';

import { MovieLikesService } from './movie-likes.service';

describe('MovieLikesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MovieLikesService = TestBed.get(MovieLikesService);
    expect(service).toBeTruthy();
  });
});
