import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupRoutingModule } from './group-routing.module';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    GroupRoutingModule,
    MatDialogModule,
  ],
  providers: [DatePipe],
})
export class GroupModule { }
