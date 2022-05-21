import { Column, Entity } from 'typeorm';
import BaseModel from './BaseModel';
import User from './User';
import Project from './Project';
import Email from '../Types/Email';
import EmailTemplateType from '../Types/Email/EmailTemplateType';
import OperationResult from '../Types/Operation/OperationResult';
import Hostname from '../Types/API/Hostname';

@Entity({
    name: 'EmailLog',
})
export default class EmailLog extends BaseModel {
    @Column()
    public fromEmail?: Email = undefined;

    @Column()
    public fromName?: string = undefined;

    @Column()
    public project?: Project;

    @Column()
    public toEmail?: Email = undefined;

    @Column()
    public subject?: string = undefined;

    @Column()
    public body?: string = undefined;

    @Column()
    public templateType?: EmailTemplateType;

    @Column()
    public status?: OperationResult;

    @Column()
    public errorDescription?: string = undefined;

    @Column()
    public smtpHost?: Hostname;

    @Column()
    public deletedByUser?: User;
}
