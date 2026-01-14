import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {
  bookId = '';
  book: Book | null = null;
  private stateEditionCount = 0;
  private statePublishYear = 0;
  private stateCoverId = 0;
  noCoverUrl = 'https://via.placeholder.com/220x320?text=No+Cover';

  constructor(private route: ActivatedRoute, private bookService: BookService) {}

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.bookId) {
      return;
    }

    const state = history.state || {};
    this.stateEditionCount =
      typeof state.edition_count === 'number' ? state.edition_count : 0;
    this.statePublishYear =
      typeof state.first_publish_year === 'number' ? state.first_publish_year : 0;
    this.stateCoverId =
      typeof state.cover_id === 'number' ? state.cover_id : 0;

    this.bookService.getBookById(this.bookId).subscribe((data) => {
      this.book = this.normalizeBook(data || {});
    });
  }

  getCoverUrl(coverId: number): string {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : this.noCoverUrl;
  }

  private normalizeBook(raw: any): Book {
    return {
      key: raw?.key || `/works/${this.bookId}`,
      title: raw?.title || 'Untitled',
      edition_count: raw?.edition_count ?? this.stateEditionCount ?? 0,
      cover_id:
        Array.isArray(raw?.covers) && raw.covers.length > 0
          ? raw.covers[0]
          : this.stateCoverId ?? 0,
      first_publish_year: this.readYear(
        raw?.first_publish_year ?? this.statePublishYear ?? 0,
        raw?.first_publish_date
      ),
      subtitle: raw?.subtitle || 'No subtitle',
      description: this.readDescription(raw?.description)
    };
  }

  private readYear(yearValue: unknown, dateValue: unknown): number {
    if (typeof yearValue === 'number' && !Number.isNaN(yearValue)) {
      return yearValue;
    }
    if (typeof yearValue === 'string') {
      const parsed = Number.parseInt(yearValue, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    if (typeof dateValue === 'number' && !Number.isNaN(dateValue)) {
      return dateValue;
    }
    if (typeof dateValue === 'string') {
      const match = dateValue.match(/\b(\d{4})\b/);
      if (match) {
        return Number.parseInt(match[1], 10);
      }
    }
    return 0;
  }

  private readDescription(desc: any): string {
    if (!desc) {
      return 'No description available';
    }
    if (typeof desc === 'string') {
      return desc;
    }
    if (typeof desc === 'object' && 'value' in desc) {
      return String(desc.value);
    }
    return 'No description available';
  }
}
