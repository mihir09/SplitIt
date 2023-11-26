import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupComponent } from './group.component';
import { AddExpenseComponent } from './expense/add-expense/add-expense.component';
import { ListExpenseComponent } from './expense/list-expense/list-expense.component';
import { AddMemberComponent } from './member/add-member/add-member.component';
import { ListBalanceComponent } from './balance/list-balance/list-balance.component';

const routes: Routes = [
  {
    path: '',
    component: GroupComponent,
    children: [
      { path: 'add-expense', component: AddExpenseComponent },
      { path: 'list-expense', component: ListExpenseComponent },
      { path: 'add-member', component: AddMemberComponent },
      { path: 'list-balance', component: ListBalanceComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
