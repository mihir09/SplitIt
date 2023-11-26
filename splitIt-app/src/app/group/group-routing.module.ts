import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupComponent } from './group.component';
import { AddExpenseComponent } from './expense/add-expense/add-expense.component';

const routes: Routes = [
  {
    path: '',
    component: GroupComponent,
    children: [
      { path: 'add-expense', component: AddExpenseComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
