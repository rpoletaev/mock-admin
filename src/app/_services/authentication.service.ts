import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {User} from '../_models/user';

class refreshResponse {
    accessToken: string
    refreshToken: string
}

@Injectable({providedIn: 'root'})
export class AuthenticationService{
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient){
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/clients/login`, {email, password})
            .pipe(map(user => {
                user.email = email;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    refreshAccessToken() {
        return this.http.post<refreshResponse>(`${environment.apiUrl}/clients/refresh`, {'token': this.currentUserValue.refreshToken})
            .pipe(map(resp => {
                let u = this.currentUserValue;
                u.accessToken = resp.accessToken;
                u.refreshToken = resp.refreshToken;
                localStorage.setItem('currentUser', JSON.stringify(u));
                this.currentUserSubject.next(u);
                return u;
            }))
    }
}