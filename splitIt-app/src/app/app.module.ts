import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CreateGroupComponent } from './create-group/create-group.component';
import { GroupComponent } from './group/group.component';

import { NavbarComponent } from './navbar/navbar.component';
import { ExpenseFilterPipe } from './expense-filter.pipe';

import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddExpenseComponent } from './group/expense/add-expense/add-expense.component';
import { ListExpenseComponent } from './group/expense/list-expense/list-expense.component';
import { ExpenseDetailsComponent } from './group/expense/list-expense/expense-details/expense-details.component';

import { AddMemberComponent } from './group/member/add-member/add-member.component';

import { ListBalanceComponent } from './group/balance/list-balance/list-balance.component';
import { AbsPipe } from './abs.pipe';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { CalculatorComponent } from './calculator/calculator.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    CreateGroupComponent,
    GroupComponent,
    NavbarComponent,
    ExpenseFilterPipe,
    AddExpenseComponent,
    ListExpenseComponent,
    ExpenseDetailsComponent,
    AddMemberComponent,
    ListBalanceComponent,
    AbsPipe,
    LoadingSpinnerComponent,
    CalculatorComponent,
  ],
  imports: [
    MatCardModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatSelectModule,
    BrowserAnimationsModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
