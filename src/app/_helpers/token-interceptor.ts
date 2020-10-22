import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthenticationService } from '../_services/authentication.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;

    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(public auth: AuthenticationService){}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).catch(error => {
            if (
                request.url.includes("refresh") ||
                request.url.includes("login")
            ) {
                if (request.url.includes("refresh")) {
                    this.auth.logout();
                }
                return Observable.throw(error);
            }

            if (error.status !== 401) {
                return Observable.throw(error);
            }

            if (this.refreshTokenInProgress) {
                return this.refreshTokenSubject
                    .filter(result => result !== null)
                    .take(1)
                    .switchMap(() => next.handle(this.addAuthenticationToken(request)));
            } else {
                this.refreshTokenInProgress = true;

                this.refreshTokenSubject.next(null);

                return this.auth
                    .refreshAccessToken()
                    .switchMap((token: any) => {
                        this.refreshTokenInProgress = false;
                        this.refreshTokenSubject.next(token);

                        return next.handle(this.addAuthenticationToken(request));
                    })
                    .catch((err: any) => {
                        this.refreshTokenInProgress = false;

                        this.auth.logout();
                        return Observable.throw(error);
                    });
            }
        });
    }

    addAuthenticationToken(request) {
        const accessToken = this.auth.getAccessToken();

        if (!accessToken) {
            return request;
        }

        return request.clone({
            setHeaders: {
                "X-Auth-Token": this.auth.getAccessToken()
            }
        });
    }
}
