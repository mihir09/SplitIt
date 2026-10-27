import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { API_BASE_URL } from './api.config';
describe('API authentication',()=>{
  let http:HttpClient, control:HttpTestingController, router:any;
  beforeEach(()=>{
    router={navigate:jasmine.createSpy('navigate')};
    TestBed.configureTestingModule({imports:[HttpClientTestingModule],providers:[{provide:Router,useValue:router},{provide:HTTP_INTERCEPTORS,useClass:AuthInterceptor,multi:true}]});
    http=TestBed.inject(HttpClient); control=TestBed.inject(HttpTestingController);
    localStorage.setItem('token','test-token');
  });
  afterEach(()=>{control.verify();localStorage.removeItem('token');});
  it('attaches tokens only to the app API',()=>{
    http.get(API_BASE_URL+'/groups/123').subscribe();
    const api=control.expectOne(API_BASE_URL+'/groups/123');expect(api.request.headers.get('Authorization')).toBe('Bearer test-token');api.flush({});
    http.get('https://example.test/other').subscribe();
    const other=control.expectOne('https://example.test/other');expect(other.request.headers.has('Authorization')).toBeFalse();other.flush({});
  });
  it('clears expired sessions and navigates to login',()=>{
    http.get(API_BASE_URL+'/groups/123').subscribe({error:()=>{}});
    control.expectOne(API_BASE_URL+'/groups/123').flush({}, {status:401,statusText:'Unauthorized'});
    expect(localStorage.getItem('token')).toBeNull();expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('does not redirect away from a failed login',()=>{
    http.post(API_BASE_URL+'/login',{}).subscribe({error:()=>{}});
    const login=control.expectOne(API_BASE_URL+'/login');expect(login.request.headers.has('Authorization')).toBeFalse();login.flush({}, {status:401,statusText:'Unauthorized'});
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
