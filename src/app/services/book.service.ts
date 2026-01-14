import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly baseUrl = 'https://openlibrary.org/subjects/computers.json';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getBookById(id: string): Observable<any> {
    return this.http.get<any>(`https://openlibrary.org/works/${id}.json`);
  }

  searchByTitle(works: any[], title: string): any[] {
    if (!title) {
      return works;
    }
    const term = title.toLowerCase();
    return works.filter((w) => (w?.title || '').toLowerCase().startsWith(term));
  }

  searchByKeywords(works: any[], keywords: string): any[] {
    if (!keywords) {
      return works;
    }
    const term = keywords.toLowerCase();
    return works.filter((w) =>
      this.readKeywordTerms(w).some((value) => value.startsWith(term))
    );
  }

  searchByIsbn(works: any[], isbn: string): any[] {
    if (!isbn) {
      return works;
    }
    const term = isbn.replace(/[-\s]/g, '').toLowerCase();
    return works.filter((w) => {
      const isbnList = this.readIsbns(w);
      return isbnList.some((value) => value.includes(term));
    });
  }

  searchByYear(works: any[], yearInput: string | number): any[] {
    const term = String(yearInput || '').trim();
    if (!term) {
      return works;
    }
    return works.filter((w) => {
      const yearValue = this.readYear(w);
      if (!yearValue) {
        return false;
      }
      return String(yearValue).startsWith(term);
    });
  }

  private readKeywordTerms(work: any): string[] {
    const subject = Array.isArray(work?.subject) ? work.subject : [];
    const title = work?.title ? String(work.title) : '';
    const subtitle = work?.subtitle ? String(work.subtitle) : '';
    return [title, subtitle, ...subject]
      .map((value) => String(value).toLowerCase())
      .filter((value) => value.length > 0);
  }

  private readIsbns(work: any): string[] {
    const list: string[] = [];
    const availability = work?.availability?.isbn;
    const isbn = work?.isbn;
    const isbn10 = work?.isbn_10;
    const isbn13 = work?.isbn_13;

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

  private readYear(work: any): number {
    const yearValue = work?.first_publish_year;
    if (typeof yearValue === 'number' && !Number.isNaN(yearValue)) {
      return yearValue;
    }
    if (typeof yearValue === 'string') {
      const parsed = Number.parseInt(yearValue, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    const dateValue = work?.first_publish_date;
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
}
