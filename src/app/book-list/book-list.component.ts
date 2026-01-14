import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';
import { SearchCriteria, SearchService } from '../services/search.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit, OnDestroy {
  booksList: any[] = [];
  private allBooks: any[] = [];
  private searchSub?: Subscription;
  private criteria: SearchCriteria = { title: '', keywords: '', isbn: '', year: '' };
  isLoading = true;
  skeletons = Array.from({ length: 8 });

  noCoverUrl = 'https://via.placeholder.com/128x180?text=No+Cover';

  constructor(
    private bookService: BookService,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.allBooks = data?.works ?? [];
      this.booksList = this.allBooks;
      this.applyFilters(this.criteria);
      this.isLoading = false;
    });

    this.searchSub = this.searchService.criteria$.subscribe((criteria) => {
      this.criteria = criteria;
      this.applyFilters(criteria);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  getCoverUrl(coverId: number): string {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : this.noCoverUrl;
  }

  goToDetails(book: any): void {
    const id = this.extractId(book.key);
    if (!id) {
      return;
    }
    this.router.navigate(['/books', id], {
      state: {
        edition_count: book?.edition_count ?? 0,
        first_publish_year: book?.first_publish_year ?? 0,
        cover_id: book?.cover_id ?? 0
      }
    });
  }

  private applyFilters(criteria: SearchCriteria): void {
    if (this.allBooks.length === 0) {
      this.booksList = [];
      return;
    }

    const t = (criteria.title ?? '').trim().toLowerCase();
    const y = String(criteria.year ?? '').trim();
    const k = (criteria.keywords ?? '').trim().toLowerCase();
    const i = (criteria.isbn ?? '').trim().toLowerCase().replace(/[-\s]/g, '');

    this.booksList = this.allBooks.filter((book) => {
      const titleOk =
        !t || ((book?.title ?? '').toString().toLowerCase().startsWith(t));

      const yearStr =
        (book?.first_publish_year ?? '').toString();

      const yearOk =
        !y || yearStr.startsWith(y);

      const keywordsOk =
        !k || this.readKeywordTerms(book).some((value) => value.startsWith(k));

      const isbnOk =
        !i || this.readIsbnList(book).some((value) => value.includes(i));

      return titleOk && yearOk && keywordsOk && isbnOk;
    });
  }

  private readKeywordTerms(book: any): string[] {
    const subject = Array.isArray(book?.subject) ? book.subject : [];
    const title = book?.title ? String(book.title) : '';
    const subtitle = book?.subtitle ? String(book.subtitle) : '';
    return [title, subtitle, ...subject]
      .map((value) => String(value).toLowerCase())
      .filter((value) => value.length > 0);
  }

  private readIsbnList(book: any): string[] {
    const list: string[] = [];
    const availability = book?.availability?.isbn;
    const isbn = book?.isbn;
    const isbn10 = book?.isbn_10;
    const isbn13 = book?.isbn_13;

    [availability, isbn, isbn10, isbn13].forEach((value) => {
      if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => list.push(String(v)));
      } else {
        list.push(String(value));
      }
    });

    return list.map((v) => v.replace(/[-\s]/g, '').toLowerCase());
  }

  private extractId(key: string): string {
    const parts = (key || '').split('/');
    return parts[parts.length - 1] || '';
  }

  private normalizeBook(raw: any): Book {
    return {
      key: raw?.key || '',
      title: raw?.title || 'Untitled',
      edition_count: raw?.edition_count ?? 0,
      cover_id: raw?.cover_id ?? 0,
      first_publish_year: raw?.first_publish_year ?? 0,
      subtitle: raw?.subtitle || 'No subtitle',
      description: this.readDescription(raw?.description)
    };
  }

  private readDescription(desc: any): string {
    if (!desc) {
      return 'No description';
    }
    if (typeof desc === 'string') {
      return desc;
    }
    if (typeof desc === 'object' && 'value' in desc) {
      return String(desc.value);
    }
    return 'No description';
  }
}
