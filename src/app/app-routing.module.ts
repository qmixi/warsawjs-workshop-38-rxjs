import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';


const routes: Routes = [
  {
    path: 'virtual-time-scheduling',
    loadChildren: './pages/virtual-time/virtual-time.module#VirtualTimeModule'
  },
  {
    path: 'movie-likes',
    loadChildren: './pages/movie-likes/movie-likes.module#MovieLikesModule'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
