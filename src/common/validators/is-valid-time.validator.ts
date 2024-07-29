import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidTimeConstraint implements ValidatorConstraintInterface {
  validate(time: string) {
    const regex24Hour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const regex12Hour = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    return regex24Hour.test(time) || regex12Hour.test(time);
  }

  defaultMessage() {
    return 'Time must be in HH:mm (24-hout) or hh:mm AM/PM (12-hour) format';
  }
}

export function IsValidTime(validationOptions?: ValidatorOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidTimeConstraint,
    });
  };
}
