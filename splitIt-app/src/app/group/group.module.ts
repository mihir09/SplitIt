import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupRoutingModule } from './group-routing.module';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
  
  ],
  imports: [
    CommonModule,
    GroupRoutingModule,
  ],
  providers: [DatePipe],
})
export class GroupModule { }
