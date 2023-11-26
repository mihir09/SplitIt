import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../users.service';
import { Group } from '../models/group.model';
import { AuthService } from '../auth.service';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groupId: string = '';
  groupName: string = '';

  constructor(private route: ActivatedRoute, private groupService: GroupService) {}

  ngOnInit() {
    this.route.params.subscribe(res => this.groupId = res['groupId']);
    this.groupService.getGroupDetails(this.groupId).subscribe(response => this.groupName = response.name)
  }

  handleGroupName(groupName: string) {
    this.groupName = groupName
  }
}