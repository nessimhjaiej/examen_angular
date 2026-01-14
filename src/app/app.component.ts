import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeadBarComponent } from './head-bar/head-bar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchCriteria, SearchService } from './services/search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeadBarComponent, SearchBarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router: Router, private searchService: SearchService) {}

  onSearch(criteria: SearchCriteria): void {
    this.searchService.setCriteria(criteria);
    this.router.navigate(['/books']);
  }
}
