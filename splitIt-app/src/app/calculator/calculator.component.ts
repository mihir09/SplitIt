import { Component } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  display = '0';
  currentInput = '';
  operator = '';
  previousValue = '';
  lastOperation = '';

  onDigitClick(digit: string): void {
    if (this.display === '0') {
      this.display = digit;
    } else {
      if (this.operator === '=') {
        this.display = digit;
        this.operator = '';
      }
      else {
        this.display += digit;
      }
    }
  }

  onOperatorClick(operator: string): void {
    if (this.operator !== '') {
      this.calculate();
    }
    this.operator = operator;

    this.previousValue = this.display;
    this.currentInput = '';
    this.display = '0';
    this.lastOperation = '';
  }

  onEqualClick(): void {
    this.calculate();
    this.operator = '=';
  }

  onClearClick(): void {
    this.display = '0';
    this.currentInput = '';
    this.operator = '';

    console.log(this.operator)
    this.previousValue = '';
  }

  onDoubleZeroClick() {
    this.display += '00';
  }

  onClearEntryClick() {
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1);
    }
    else{
      this.display = '0';
    }
  }

  private calculate(): void {
    const currentValue = parseFloat(this.display);
    const previousValue = parseFloat(this.previousValue);
    switch (this.operator) {
      case '+':
        this.display = (previousValue + currentValue).toFixed(2).toString();
        break;
      case '-':
        this.display = (previousValue - currentValue).toFixed(2).toString();
        break;
      case '*':
        this.display = (previousValue * currentValue).toFixed(2).toString();
        break;
      case '/':
        this.display = (previousValue / currentValue).toFixed(2).toString();
        break;
      case '%':
        this.display = (previousValue * (currentValue/100)).toFixed(2).toString();
        break;
      default:
        break;
    }
    this.lastOperation = this.previousValue + " " + this.operator + " " + currentValue.toString() + " = " + this.display;
  }
}
