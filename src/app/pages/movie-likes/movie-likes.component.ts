import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Movie} from './movie';

@Component({
  selector: 'app-movie-likes',
  template: `
    <div class="container">
      <h1>MoviePickr</h1>
      <div class="row">
        <app-movie-picker
                *ngFor="let movie of movies"
                [movie]=movie
                (movieChanged)="movieChanged($event)"
                class="column"
        ></app-movie-picker>
      </div>
      <div class="row">
        <div class="column">
          <div class="console">
            <div class="console-header">
              <p>Output</p>
              <div class="button-wrapper">
                <button id="clear-output" class="clear-output">🗑️</button>
              </div>
            </div>
            <ul id="output"></ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./movie-likes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MovieLikesComponent implements OnInit {

  movies: Movie[] = [
    {id: 'movie1', name: 'Paterson', img: '/assets/images/paterson.jpg', liked: false},
    {id: 'movie2', name: 'Rogue One', img: '/assets/images/rogueone.jpg', liked: false},
  ];

  constructor() {
  }

  ngOnInit() {
  }

  movieChanged(movie: Movie) {
    const idx = this.movies.findIndex(m => m.id === movie.id);
    this.movies[idx] = movie;
  }
}
