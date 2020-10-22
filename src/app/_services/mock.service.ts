import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import { MockStatus } from '../_models/mock';

@Injectable({providedIn: 'root'})
export class MockService {
    // private awbstatuses: AWBStatus[]

    constructor(private http: HttpClient) { }

    getMockStatus() {
        return this.http.get<MockStatus>(`${environment.apiUrl}orders/mock/status`);
    }

    activateMock() {
        return this.http.post<Boolean>(`${environment.apiUrl}orders/mock/activate`, {});
    }

}