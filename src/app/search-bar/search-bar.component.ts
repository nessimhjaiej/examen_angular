import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchCriteria } from '../services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  title = '';
  keywords = '';
  isbn = '';
  year: string | number = '';

  @Output() search = new EventEmitter<SearchCriteria>();

  emitSearch(): void {
    this.search.emit({
      title: this.title.trim(),
      keywords: this.keywords.trim(),
      isbn: this.isbn.trim(),
      year: String(this.year ?? '').trim()
    });
  }

  clear(): void {
    this.title = '';
    this.keywords = '';
    this.isbn = '';
    this.year = '';
    this.emitSearch();
  }
}
