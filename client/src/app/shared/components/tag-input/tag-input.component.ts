import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  template: `
    <div class="tag-input-container">
      <div class="tags-wrapper">
        @for (tag of tags; track tag) {
          <span class="tag tag-removable">
            {{ tag }}
            <span class="tag-remove" (click)="removeTag(tag)">×</span>
          </span>
        }
        <input
          type="text"
          class="tag-input"
          [placeholder]="placeholder"
          (keydown)="onKeyDown($event)"
          (blur)="onInputBlur($event)"
          #tagInput
        />
      </div>
    </div>
  `,
  styles: [`
    .tag-input-container {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.375rem;
      background: var(--surface);
      min-height: 42px;
    }
    
    .tag-input-container:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }
    
    .tags-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      align-items: center;
    }
    
    .tag-input {
      flex: 1;
      min-width: 100px;
      border: none;
      outline: none;
      font-size: 0.875rem;
      padding: 0.25rem;
      background: transparent;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInputComponent),
      multi: true
    }
  ]
})
export class TagInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Add tag and press Enter';
  
  tags: string[] = [];
  
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    this.tags = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if ((event.key === 'Enter' || event.key === ',') && value) {
      event.preventDefault();
      this.addTag(value);
      input.value = '';
    } else if (event.key === 'Backspace' && !value && this.tags.length) {
      this.removeTag(this.tags[this.tags.length - 1]);
    }
  }

  onInputBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      this.addTag(value);
      input.value = '';
    }
    this.onTouched();
  }

  addTag(tag: string): void {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !this.tags.includes(normalized)) {
      this.tags = [...this.tags, normalized];
      this.onChange(this.tags);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.onChange(this.tags);
  }
}
