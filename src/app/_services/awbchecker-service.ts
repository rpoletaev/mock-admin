import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import { AWBStatus, AWBResult } from '../_models/awb';

@Injectable({providedIn: 'root'})
export class AWBCheckerService {
    // private awbstatuses: AWBStatus[]

    constructor(private http: HttpClient) { }

    getStatuses() {
        return this.http.get<AWBStatus[]>(`${environment.apiUrl}orders/mock/icargo-statuses`);
    }

    getResults() {
        return this.http.get<AWBResult[]>(`${environment.apiUrl}orders/mock/check-awb-results`);
    }

    saveResults(results: AWBResult[]) {
        return this.http.post<any>(`${environment.apiUrl}orders/mock/check-awb-results`, results);
    }
}