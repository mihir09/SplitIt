import { of, throwError } from 'rxjs';
import { ListBalanceComponent } from './list-balance.component';
describe('balance failure recovery',()=>{
  function component(groupService:any) {
    return new ListBalanceComponent(groupService,{getUserDetailsByEmail:()=>of({id:'alice',name:'Alice'})} as any,{queryParams:of({groupId:'group'})} as any,{getCurrentUser:()=> 'alice@example.test'} as any);
  }
  it('clears loading and offers retry when group loading fails',()=>{
    const service={getGroupDetailsWithMembers:()=>throwError(()=>new Error('offline'))};
    const page=component(service);page.ngOnInit();
    expect(page.loading).toBeFalse();expect(page.errorMessage).toContain('try again');
    service.getGroupDetailsWithMembers=()=>of({members:[{id:'alice',balance:1}],balance:[],balancesWithNames:[]}) as any;
    page.fetchGroupDetails();expect(page.errorMessage).toBe('');expect(page.currentUser.balance).toBe(1);
  });
  it('clears loading when a payment fails',()=>{
    const page=component({settleBalance:()=>throwError(()=>({error:{message:'Please refresh'}}))});
    page.groupDetails={balance:[{_id:'payment'}]} as any;page.loading=true;page.settleSelectedBalance(0);
    expect(page.loading).toBeFalse();expect(page.errorMessage).toBe('Please refresh');
  });
});
