import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthServices } from './auth.services';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const auth = inject(AuthServices);
  const token = auth.getToken();

  if (!token) {
    return next(req);
  }

  const headers = req.headers.set('Authorization', `Bearer ${token}`);

  const newReq = req.clone({ headers });

  return next(newReq);
}
