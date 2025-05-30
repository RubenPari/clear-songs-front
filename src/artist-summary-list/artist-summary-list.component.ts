import { Component } from '@angular/core';
import {ArtistSummaryComponent} from '../artist-summary/artist-summary.component';

@Component({
  selector: 'app-artist-summary-list',
  imports: [
    ArtistSummaryComponent
  ],
  templateUrl: './artist-summary-list.component.html',
  styleUrl: './artist-summary-list.component.css'
})
export class ArtistSummaryListComponent {

}
