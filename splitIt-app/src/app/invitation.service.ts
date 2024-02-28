import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = 'http://localhost:3000/api/invitations';

  constructor(private http: HttpClient) { }

  inviteNewUser(senderEmail: string, userEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite`, { senderEmail, userEmail });
  }

  sendInvitation(senderEmail: string, userEmail: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { senderEmail, userEmail, groupId });
  }

  acceptInvitation(invitationId: string, userEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept`, { invitationId, userEmail });
  }

  declineInvitation(invitationId: string, userEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/decline`, { invitationId, userEmail });
  }
}
