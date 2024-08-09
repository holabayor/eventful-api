import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventCategory {
  FASHION = 'Fashion & Beauty',
  BUSINESS = 'Business & Professional',
  TECHNOLOGY = 'Technology',
  HEALTH = 'Health & Wellness',
  MUSIC = 'Music',
  ART = 'Art & Culture',
  EDUCATION = 'Education & Learning',
  SPORTS = 'Sports & Fitness',
  TRAVEL = 'Travel & Adventure',
  FOOD = 'Food & Drink',
  CHARITY = 'Charity & Causes',
  FILM = 'Film & Media',
  FAMILY = 'Family & Kids',
  GOVERNMENT = 'Government & Politics',
  RELIGION = 'Religion & Spirituality',
  SCIENCE = 'Science & Innovation',
  AUTOMOTIVE = 'Automotive',
  HOBBIES = 'Hobbies & Special Interests',
  FESTIVALS = 'Festivals & Fairs',
  SOCIAL = 'Social & Networking',
  OTHERS = 'Others',
}

@Schema({
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Category extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// A pre-save hook to convert the name into proper case
CategorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.name = this.name.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
  next();
});
