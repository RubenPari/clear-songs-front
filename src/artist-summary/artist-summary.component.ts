import {Component, Input} from '@angular/core';
import ArtistSummary from './artist-summary.model';

@Component({
  selector: 'app-artist-summary',
  standalone: true,
  templateUrl: './artist-summary.component.html',
  styleUrl: './artist-summary.component.css'
})
export class ArtistSummaryComponent {
  @Input() artist: ArtistSummary = {
    name: '',
    imageUrl: '',
    tracksCount: 0
  };
}
