import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { AWBResult, AWBStatus } from '../_models/awb';
import { MockStatus } from '../_models/mock';

const statuses: AWBStatus[] = [
    {code: "ARR", caption: "груз прибыл определённым рейсом"},
    {code: "DEP", caption: "груз отправлен определённым рейсом"},
    {code: "RCS", caption: "груз принят от грузоотправителя/агента для перевозки"},
    {code: "RCF", caption: "партия груза физически получена с указанного рейса"},
    {code: "AWR", caption: "прибывшие документы получены с рейса"},
    {code: "DLV", caption: "груз доставлен грузополучателю/агенту"},
    {code: "RCT", caption: "партия трансферного груза получена с рейса иной авиакомпании"},
    {code: "TFD", caption: "партия трансферного груза передана на рейс иной авиакомпании"}
];

const results: AWBResult[] = [
    {documentId: 135, statusCode: "ARR", dateChange: new Date()},
    {documentId: 136, statusCode: "DEP", dateChange: new Date()}
];

let isMockActive: boolean = false;

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/mock/icargo-statuses') && method === 'GET':
                    return getAWBStatuses();
                case url.endsWith('/mock/check-awb-results') && method === 'GET':
                    return getResults();
                case url.endsWith('/mock/status') && method === 'GET':
                    return getMockStatus();
                    case url.endsWith('/mock/activate') && method === 'POST':
                        return activateMock();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        function getAWBStatuses() {
            if (!isLoggedIn()) return unauthorized();
            return ok(statuses);
        }

        function getResults() {
            if (!isLoggedIn()) return unauthorized();
            return ok(results);
        }

        function getMockStatus() {
            return ok(new MockStatus(isMockActive));
        }

        function activateMock() {
            return ok(true);
        }


        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return headers.get('X-Auth-Key').length > 0;
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};