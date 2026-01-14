import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchCriteria {
  title: string;
  keywords: string;
  isbn: string;
  year: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly criteriaSubject = new BehaviorSubject<SearchCriteria>({
    title: '',
    keywords: '',
    isbn: '',
    year: ''
  });

  readonly criteria$ = this.criteriaSubject.asObservable();

  setCriteria(criteria: SearchCriteria): void {
    this.criteriaSubject.next(criteria);
  }
}
