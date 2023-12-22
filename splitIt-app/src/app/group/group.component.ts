import { Component, OnInit, ViewChild } from '@angular/core';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  groupId: string = '';
  groupName: string = '';

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(res => this.groupId = res['groupId']);
    this.groupService.getGroupDetails(this.groupId).subscribe(response => this.groupName = response.name)
  }

  handleGroupName(groupName: string) {
    this.groupName = groupName
  }

  navigate(event: any): void {
    const routeName = (event.target as HTMLInputElement).value
    this.router.navigate(['group', this.groupId, routeName], { queryParams: { groupId: this.groupId } });
  }

  @ViewChild(RouterOutlet, { static: true }) routerOutlet!: RouterOutlet;

  routerOutletHasContent(): boolean {
    return this.routerOutlet && this.routerOutlet.isActivated;
  }
}