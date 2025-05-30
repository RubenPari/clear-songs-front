import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ArtistSummaryComponent} from '../artist-summary/artist-summary.component';
import ArtistSummary from '../artist-summary/artist-summary.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ArtistSummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'clear-songs-front';
  artistSummary: ArtistSummary = {
    name: 'Eminem',
    imageUrl: 'https://yve.ro/wp-content/uploads/2017/10/18-lucruri-interesante-despre-Eminem.jpg',
    tracksCount: 4
  }
}
