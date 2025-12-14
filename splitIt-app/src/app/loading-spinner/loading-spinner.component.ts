import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  @Input() spinnerMessage: string = 'Simplify your group expenses with SplitIt! Track balances 📊, manage expenses 💸, and keep everything in check. Choose an option to get started.🚀';
}
