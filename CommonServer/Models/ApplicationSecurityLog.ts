import mongoose, {
    RequiredFields,
    UniqueFields,
    EncryptedFields,
} from '../Infrastructure/ORM';

const Schema: $TSFixMe = mongoose.Schema;

const schema: $TSFixMe = new Schema(
    {
        securityId: {
            type: Schema.Types.ObjectId,
            ref: 'ApplicationSecurity',
            index: true,
        },
        componentId: {
            type: Schema.Types.ObjectId,
            ref: 'Component',
            index: true,
        },
        data: Object,
        deleted: { type: Boolean, default: false },
        deleteAt: Date,
    },
    { timestamps: true }
);

export const requiredFields: RequiredFields = schema.requiredPaths();

export const uniqueFields: UniqueFields = [];
export const encryptedFields: EncryptedFields = [];

export const slugifyField: string = '';

export default mongoose.model('ApplicationSecurityLog', schema);