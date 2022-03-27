import mongoose from '../utils/orm';

const Schema = mongoose.Schema;

const globalConfigSchema = new Schema({
    name: String,
    value: Object,

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('GlobalConfig', globalConfigSchema);