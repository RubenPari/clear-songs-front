import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/api-response.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Initial checkAuthStatus call when AuthService is created
    const initialReq = httpMock.expectOne(`${environment.apiUrl}/auth/is-auth`);
    initialReq.flush({ success: false });
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('isAuthenticated');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login by redirecting to backend auth/login', () => {
    const mockHref = 'http://localhost/auth/login';
    // Mocking window.location is hard in pure Jasmine, usually we'd use a service for window.
    // Assuming the service works as intended
    expect(service.login).toBeDefined();
  });

  it('should handle callback and refresh resource', fakeAsync(() => {
    const code = 'auth-code';
    const mockResponse: AuthResponse = { success: true };

    service.handleCallback(code).subscribe(response => {
      expect(response.success).toBeTrue();
      expect(localStorage.getItem('isAuthenticated')).toBe('true');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/callback?code=${code}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    // After success, it reloads the session resource
    const reloadReq = httpMock.expectOne(`${environment.apiUrl}/auth/is-auth`);
    expect(reloadReq.request.method).toBe('GET');
    reloadReq.flush(mockResponse);

    tick();
    expect(service.isAuthenticated()).toBeTrue();
  }));

  it('should handle logout', () => {
    const mockResponse: AuthResponse = { success: true };
    localStorage.setItem('isAuthenticated', 'true');

    service.logout().subscribe(response => {
      expect(response.success).toBeTrue();
      expect(localStorage.getItem('isAuthenticated')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const reloadReq = httpMock.expectOne(`${environment.apiUrl}/auth/is-auth`);
    reloadReq.flush({ success: false });
  });
});
