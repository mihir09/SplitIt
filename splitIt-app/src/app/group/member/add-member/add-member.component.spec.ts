import { FormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { AddMemberComponent } from './add-member.component';
describe('invitation form',()=>{
  it('does not send an invalid email and blocks duplicate requests while sending',()=>{
    const pending=new Subject();const send=jasmine.createSpy('send').and.returnValue(pending);
    const page=new AddMemberComponent(new FormBuilder(),{} as any,{sendInvitation:send} as any,{getCurrentUser:()=> 'you@example.test'} as any,{} as any,{} as any);
    page.groupId='test';page.createForm.setValue({email:'not-an-email'});page.onAddUser();expect(send).not.toHaveBeenCalled();
    page.createForm.setValue({email:'friend@example.test'});page.onAddUser();page.onAddUser();expect(send).toHaveBeenCalledTimes(1);expect(page.isSending).toBeTrue();
    pending.complete();expect(page.isSending).toBeFalse();
  });
});
