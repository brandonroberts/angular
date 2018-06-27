// #docplaster
// #docregion form-builder
import { Component } from '@angular/core';
// #docregion form-builder-imports, validator-imports, form-array-imports
import {
// #enddocregion validator-imports, form-array-imports
  FormBuilder,
// #enddocregion form-builder-imports, form-builder
// #docregion validator-imports
  Validators,
// #enddocregion validator-imports
// #docregion form-array-imports
  FormArray
// #docregion form-builder-imports, form-builder, validator-imports
} from '@angular/forms';
// #enddocregion form-builder-imports, validator-imports, form-array-imports

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent {
// #docregion required-validator, aliases
  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
// #enddocregion form-builder, required-validator
    aliases: this.fb.array([
      this.fb.control('')
    ])
// #docregion form-builder, required-validator
  });
// #enddocregion form-builder, required-validator, aliases
// #docregion aliases-getter

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

// #enddocregion aliases-getter
// #docregion inject-form-builder, form-builder
  constructor(private fb: FormBuilder) { }

// #enddocregion inject-form-builder

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    });
  }
// #enddocregion form-builder
// #docregion add-alias

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }
// #enddocregion add-alias
// #docregion on-submit

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }
// #enddocregion on-submit
// #docregion form-builder
}
// #enddocregion form-builder
