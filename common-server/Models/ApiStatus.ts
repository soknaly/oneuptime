import mongoose, { RequiredFields, UniqueFields } from '../Infrastructure/ORM';

const Schema = mongoose.Schema;
const schema = new Schema(
    {
        deleted: { type: Boolean, default: false },
        deletedAt: Date,
        status: String,
        lastOperation: { type: String, enum: ['create', 'update', 'delete'] },
    },
    { timestamps: true }
);

export const requiredFields: RequiredFields = schema.requiredPaths();

export const uniqueFields: UniqueFields = [];

export const sligifyField: string = '';

export default mongoose.model('ApiStatus', schema);