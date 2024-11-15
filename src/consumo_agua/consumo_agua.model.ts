import { Schema } from 'mongoose';
import { Document } from 'mongoose';

export const WaterConsumeSchema = new Schema({
    consumerId: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },
    waterConsumed: { type: Number, required: true },
});

export interface Consumer extends Document {
    consumerId: string;
    date: Date;
    waterConsumed: number;
}